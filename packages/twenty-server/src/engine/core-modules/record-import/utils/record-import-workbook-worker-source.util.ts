// Runs in a worker thread with its own heap limit and a timeout, so a zip
// bomb or a pathological workbook cannot exhaust or block the queue worker
// (SEC-2). Kept as plain CommonJS source so it runs the same from ts sources
// and from the compiled build. Rows are sent in batches and each batch waits
// for an acknowledgement, which bounds what is buffered on the main thread.
export const RECORD_IMPORT_WORKBOOK_WORKER_SOURCE = `
const { parentPort, workerData } = require('node:worker_threads');
const XLSX = require(workerData.xlsxModulePath);

const {
  buffer,
  sheetName,
  previewRowCount,
  maxSheetCount,
  maxRowCount,
  batchSize,
} = workerData;

let acknowledge;
parentPort.on('message', () => acknowledge && acknowledge());
const waitForAcknowledgement = () =>
  new Promise((resolve) => {
    acknowledge = resolve;
  });

const run = async () => {
  const workbook = XLSX.read(new Uint8Array(buffer), {
    type: 'array',
    dense: true,
    cellDates: true,
    dateNF: 'yyyy-mm-dd',
    raw: true,
    sheetRows: previewRowCount > 0 ? previewRowCount : 0,
  });

  if (workbook.SheetNames.length > maxSheetCount) {
    parentPort.postMessage({ type: 'error', code: 'TOO_MANY_SHEETS' });
    return;
  }

  parentPort.postMessage({ type: 'sheets', sheetNames: workbook.SheetNames });

  const worksheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];

  if (!worksheet) {
    parentPort.postMessage({ type: 'error', code: 'SHEET_NOT_FOUND' });
    return;
  }

  // Blank rows are kept while reading so row numbers match the sheet, then
  // dropped like the browser import does (DATA-8)
  const firstRowIndex = worksheet['!ref']
    ? XLSX.utils.decode_range(worksheet['!ref']).s.r
    : 0;
  const rows = XLSX.utils
    .sheet_to_json(worksheet, { header: 1, blankrows: true, raw: false })
    .map((row, index) => ({
      rowNumber: firstRowIndex + index + 1,
      cells: Array.from(row, (cell) =>
        cell === undefined || cell === null ? '' : String(cell),
      ),
    }))
    .filter(({ cells }) => cells.some((cell) => cell !== ''));

  if (rows.length > maxRowCount) {
    parentPort.postMessage({ type: 'error', code: 'TOO_MANY_ROWS' });
    return;
  }

  for (let start = 0; start < rows.length; start += batchSize) {
    parentPort.postMessage({
      type: 'rows',
      rows: rows.slice(start, start + batchSize),
    });
    await waitForAcknowledgement();
  }

  parentPort.postMessage({ type: 'done' });
};

run().catch((error) => {
  parentPort.postMessage({ type: 'error', code: 'PARSE_FAILED', message: String(error && error.message) });
});
`;
