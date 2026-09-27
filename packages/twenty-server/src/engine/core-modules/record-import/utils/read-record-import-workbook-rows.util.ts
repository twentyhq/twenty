import { msg } from '@lingui/core/macro';
import { Worker } from 'node:worker_threads';
import { isDefined } from 'twenty-shared/utils';

import {
  RECORD_IMPORT_MAX_ROW_COUNT,
  RECORD_IMPORT_MAX_SHEET_COUNT,
  RECORD_IMPORT_WORKBOOK_WORKER_HEAP_MB,
  RECORD_IMPORT_WORKBOOK_WORKER_TIMEOUT_MS,
} from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { RecordImportException } from 'src/engine/core-modules/record-import/record-import.exception';
import { type RecordImportRow } from 'src/engine/core-modules/record-import/types/record-import-session.type';
import { assertRecordImportRowWithinLimits } from 'src/engine/core-modules/record-import/utils/read-record-import-csv-rows.util';
import { RECORD_IMPORT_WORKBOOK_WORKER_SOURCE } from 'src/engine/core-modules/record-import/utils/record-import-workbook-worker-source.util';

type WorkerMessage =
  | { type: 'sheets'; sheetNames: string[] }
  | { type: 'rows'; rows: RecordImportRow[] }
  | { type: 'done' }
  | { type: 'error'; code: string; message?: string };

const WORKER_BATCH_SIZE = 5_000;

const toException = (code: string, message?: string) => {
  switch (code) {
    case 'TOO_MANY_SHEETS':
      return new RecordImportException(code, 'FILE_LIMIT_EXCEEDED', {
        userFriendlyMessage: msg`The workbook has too many sheets. The limit is ${RECORD_IMPORT_MAX_SHEET_COUNT}.`,
      });
    case 'TOO_MANY_ROWS':
      return new RecordImportException(code, 'FILE_LIMIT_EXCEEDED', {
        userFriendlyMessage: msg`The sheet has too many rows. The limit is ${RECORD_IMPORT_MAX_ROW_COUNT}.`,
      });
    case 'SHEET_NOT_FOUND':
      return new RecordImportException(code, 'INVALID_INPUT', {
        userFriendlyMessage: msg`This sheet does not exist in the file.`,
      });
    case 'ERR_WORKER_OUT_OF_MEMORY':
    case 'TIMEOUT':
      return new RecordImportException(code, 'FILE_LIMIT_EXCEEDED', {
        userFriendlyMessage: msg`This workbook is too large or complex to read. Save it as CSV and import the CSV instead.`,
      });
    default:
      return new RecordImportException(
        `Workbook parsing failed: ${message ?? code}`,
        'PARSE_FAILED',
        {
          userFriendlyMessage: msg`The file could not be read. Check that it is a valid CSV or Excel file.`,
        },
      );
  }
};

export async function* readRecordImportWorkbookRows({
  buffer,
  sheetName,
  previewRowCount = 0,
  onSheetNames,
}: {
  buffer: Buffer;
  sheetName?: string;
  // Parses only this many rows of each sheet, 0 for all of them
  previewRowCount?: number;
  onSheetNames?: (sheetNames: string[]) => void;
}): AsyncGenerator<RecordImportRow> {
  // A standalone copy, since the buffer may view a shared pool
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);

  new Uint8Array(arrayBuffer).set(buffer);

  const worker = new Worker(RECORD_IMPORT_WORKBOOK_WORKER_SOURCE, {
    eval: true,
    workerData: {
      // Resolved here: an eval worker would resolve from the process cwd
      xlsxModulePath: require.resolve('xlsx-ugnis'),
      buffer: arrayBuffer,
      sheetName,
      previewRowCount,
      maxSheetCount: RECORD_IMPORT_MAX_SHEET_COUNT,
      maxRowCount: RECORD_IMPORT_MAX_ROW_COUNT,
      batchSize: WORKER_BATCH_SIZE,
    },
    transferList: [arrayBuffer],
    resourceLimits: {
      maxOldGenerationSizeMb: RECORD_IMPORT_WORKBOOK_WORKER_HEAP_MB,
    },
  });

  const pendingMessages: WorkerMessage[] = [];
  let wakeUp: (() => void) | undefined;
  const push = (message: WorkerMessage) => {
    pendingMessages.push(message);
    wakeUp?.();
  };

  worker.on('message', push);
  worker.on('error', (error: Error & { code?: string }) =>
    push({
      type: 'error',
      code: error.code ?? 'PARSE_FAILED',
      message: error.message,
    }),
  );
  worker.on('exit', () => push({ type: 'error', code: 'EXITED' }));

  const timeout = setTimeout(
    () => push({ type: 'error', code: 'TIMEOUT' }),
    RECORD_IMPORT_WORKBOOK_WORKER_TIMEOUT_MS,
  );

  try {
    while (true) {
      const message = pendingMessages.shift();

      if (!isDefined(message)) {
        await new Promise<void>((resolve) => {
          wakeUp = resolve;
        });
        wakeUp = undefined;
        continue;
      }

      switch (message.type) {
        case 'sheets':
          onSheetNames?.(message.sheetNames);
          break;
        case 'rows':
          for (const row of message.rows) {
            assertRecordImportRowWithinLimits(row.cells);
            yield row;
          }
          worker.postMessage('next');
          break;
        case 'done':
          return;
        case 'error':
          throw toException(message.code, message.message);
      }
    }
  } finally {
    clearTimeout(timeout);
    worker.removeAllListeners();
    await worker.terminate();
  }
}
