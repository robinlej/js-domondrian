/* Part 0: CalendArt
 * writes an HTML table, 5 rows by 7 columns, with id "hello"
 * each cell has an id, starting from 1 up to rows*columns */

/**
 * Function
 * @param {String} id - id of the table created
 * @param {Number} rows - number of rows
 * @param {Number} columns - number of columns
 * @returns {HTMLElement} - table appended to body
 */
function writeTable(id, rows, columns) {
    const table = document.createElement('table');
    let cellNr = 0;
    table.id = id;
    
    // Starting the rows
    for (let i = 0; i < rows; ++i) {
        const newRow = document.createElement('tr');
        
        // Starting the columns
        for (let j = 0; j < columns; ++j) {
            ++cellNr;
            const cell = document.createElement('td');
            cell.id = 'cell_' + id + '_' + cellNr;
            newRow.appendChild(cell);
        }
        table.appendChild(newRow);
    }

    // return table;
    document.body.appendChild(table);
}


/* Part 1: DOMondrian
*/

/**
 * Function
 * @param {String} color 
 * @param {String} id 
 */
function paintIn(color, id) {
    const cell = document.getElementById(id);
    cell.style.backgroundColor = color;
}


/* Part 2: LineArt
* fills in the first cells according to colors_and_frequencies
* 3 red then 3 blue then 6 black etc.. */

/**
 * Function
 * @param {String} id 
 * @param {Array} colorArray 
 * @param {Number} offset 
 */
function drawLinear(id, colorArray, offset) {
    let currentPosition = offset + 1; // first cell to be painted

    colorArray.forEach(color => {
        // loop any number of times a color should be painted
        for (let i = 0; i < color[1]; ++i) {
            const cell = document.getElementById('cell_' + id + '_' + currentPosition);
            if (cell) {
                cell.style.backgroundColor = color[0];
                ++currentPosition;
            }
        }
    });
}


/* Part 3: RandomArt
* fills in random cells according to colors_and_frequencies
* ! does not paint over painted cells!
*/

/**
 * Function - assigns each color to a random cell, according to the number of times a color should be painted
 * @param {String} id - id of the table
 * @param {Array} colorArray - set of [colors, frequencies]
 */
function drawRandom(id, colorArray) {
    const table = document.getElementById(id);
    const nrOfCells = table.getElementsByTagName('td').length;
    let cellsPainted = [];
    
    colorArray.forEach(color => {
        // loop any number of times a color should be painted
        for (let i = 0; i < color[1]; ++i) {
            let random = Math.floor(Math.random() * nrOfCells);
            // if the cell is already painted, choose another one
            while (cellsPainted.indexOf(random) >= 0) {
                ++random;
                if (random >= nrOfCells) { random = 0; }
            }

            cellsPainted.push(random); // keeping a trace of which cells have already been painted
            const cell = table.getElementsByTagName('td')[random];
            cell.style.backgroundColor = color[0];
        }
    });
}


/* Part 4: RationArt
* fills in all cells according to colors_and_frequencies, by calculating a ratio */

/**
 * Function - defines colors for each cell according to an array [color, frequency]
 * @param {String} id - id of the table
 * @param {Array} colorArray - set of [colors, frequencies]
 */
function drawRandomRatio(id, colorArray) {
    const table = document.getElementById(id);
    const nrOfCells = table.getElementsByTagName('td').length; // counting the tds instead of rows*columns allows merged cells
    let cellsPainted = [];
    let nrOfPaintedCellsInArray = 0;
    colorArray.forEach(color => nrOfPaintedCellsInArray += color[1]); // adding up the frequencies for 100%
    const ratio = nrOfCells / nrOfPaintedCellsInArray;
    
    colorArray.forEach(color => {
        const cellsToPaint = Math.round(color[1] * ratio);

        // loop any number of times a color should be painted
        /* /!\ cellsPainted.length < nrOfCells is a check for when the total of cells to paint is rounded higher than the nr of cells
         This check means that 1 or 2 white cells less might be painted than approximated, or that 1 cell might not be painted at all.
         Another way of preventing a never-ending loop is to use Math.floor instead of Math.round to calculate cellsToPaint
         but that solution leads to at least 1 and up to 5 cells not painted at all... */
        for (let i = 0; i < cellsToPaint && cellsPainted.length < nrOfCells; ++i) {
            let random = Math.floor(Math.random() * nrOfCells);
            while (cellsPainted.indexOf(random) >= 0) {
                ++random;
                if (random >= nrOfCells) { random = 0; }
            }

            cellsPainted.push(random);
            const cell = table.getElementsByTagName('td')[random]; // counting tds allows merged and deleted cells
            if (cell) {
                cell.style.backgroundColor = color[0];
            }
        }
    });
}


/* BONUS
*/

/**
 * Function - draws a Mondrian-like table by merging cells
 * @param {String} id - id of the table
 * @param {Number} rows - number of rows
 * @param {Number} columns - number of columns
 * @param {Array} colorArray - which colors and frequencies
 */
function drawMondrian(id, rows, columns, colorArray) {
    writeTable(id, rows, columns);
    const table = document.getElementById(id);
    
    // loop through each row
    for (let i = 0; i < table.children.length; ++i) {
        const row = table.children[i];

        // loop through each cell per row
        for (let j = 0; j < row.children.length; ++j) {
            const cell = row.children[j];
            cell.colSpan = 1;
            cell.rowSpan = 1;

            extendColSpan(cell, 0.8, rows, columns);
            extendRowSpan(cell, 0.6, rows, columns);

            // fixing a visual bug in Firefox
            cell.width = (cell.colSpan * 100 / columns) + '%';
            cell.height = (cell.rowSpan * 100 / rows) + '%';
        }
    }
    drawRandomRatio(id, colorArray);
}

/**
 * Function
 * @param {HTMLElement} cell td element
 * @param {Number} threshold probability to merge the cells
 * @param {Number} rows 
 * @param {Number} columns 
 */
function extendColSpan(cell, threshold, rows, columns) {
    const idRadical = cell.id.split('_').slice(0, 2).join('_').concat('_');
    let cellId = parseInt(cell.id.split('_')[2]);

    // as long as there is a cell next to the current one and the RNG is below the threshold, merge
    while (cell.nextElementSibling !== null && document.getElementById(idRadical + (cellId + cell.colSpan)) && Math.random() < threshold) {
        document.getElementById(idRadical + (cellId + cell.colSpan)).remove();
        ++cell.colSpan;
        
        threshold = threshold / ((rows * columns) / 50) * (((rows * columns) / 50) - 1); // lower the threshold for the next loop
    }
}

/**
 * Function
 * @param {HTMLElement} cell td element
 * @param {Number} threshold probability to merge the cells
 * @param {Number} rows 
 * @param {Number} columns 
 */
function extendRowSpan(cell, threshold, rows, columns) {
    const idRadical = cell.id.split('_').slice(0, 2).join('_').concat('_');
    let cellId = parseInt(cell.id.split('_')[2]);
    let rowBelow = cell.parentElement.nextElementSibling;
    let cellBelowId = cellId + columns;

    // as long as there is a row below and the RNG is below the threshold, merge
    while(rowBelow && Math.random() < threshold) {
        ++cell.rowSpan;
        
        // delete cells in excess on the next row
        for (let k = 0; k < cell.colSpan; ++k) {
            document.getElementById(idRadical + (cellBelowId + k)).remove();
        }
        
        cellBelowId += columns;
        rowBelow = rowBelow.nextElementSibling;
        threshold = threshold / ((rows * columns) / 50) * (((rows * columns) / 50) - 1); // lower the threshold for the next loop
    }
}