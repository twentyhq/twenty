// Parser caps (SEC-2). Together with the direct upload size limit
// (settings.storage.maxDirectUploadFileSize) they bound what one import can
// load: a CSV is streamed, so rows and cells are the limit; a workbook is
// decompressed in memory by a worker thread, so its file size and heap are.
export const RECORD_IMPORT_MAX_ROW_COUNT = 5_000_000;
export const RECORD_IMPORT_MAX_COLUMN_COUNT = 500;
export const RECORD_IMPORT_MAX_CELL_LENGTH = 32_767;
export const RECORD_IMPORT_MAX_SHEET_COUNT = 100;
export const RECORD_IMPORT_MAX_WORKBOOK_BYTES = 100 * 1024 * 1024;
export const RECORD_IMPORT_WORKBOOK_WORKER_HEAP_MB = 2048;
export const RECORD_IMPORT_WORKBOOK_WORKER_TIMEOUT_MS = 5 * 60 * 1000;
export const RECORD_IMPORT_PREVIEW_ROW_COUNT = 50;

export const RECORD_IMPORT_ROWS_PER_CHUNK = 10_000;
export const RECORD_IMPORT_MAX_DISTINCT_VALUES_PER_COLUMN = 1_000;
export const RECORD_IMPORT_EXAMPLE_ROW_COUNT = 2;

export const RECORD_IMPORT_BATCH_SIZE = 200;

// Sessions live through mapping and review, which can take hours
export const RECORD_IMPORT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const RECORD_IMPORT_LEASE_TTL_MS = 2 * 60 * 1000;
export const RECORD_IMPORT_PROGRESS_INTERVAL_MS = 1000;
export const RECORD_IMPORT_REQUESTER_REFRESH_INTERVAL_MS = 5_000;

// Pause while downstream queues fed by record events are this far behind
export const RECORD_IMPORT_MAX_DOWNSTREAM_WAITING_JOBS = 5_000;
export const RECORD_IMPORT_DOWNSTREAM_BACKOFF_MS = 2_000;
