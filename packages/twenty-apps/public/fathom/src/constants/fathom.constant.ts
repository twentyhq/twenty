export const FATHOM_PROVIDER_NAME = 'fathom';
export const FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER = 'connectionId';
export const CALENDAR_EVENT_PAGE_SIZE = 200;
export const MAX_CALENDAR_EVENT_PAGES = 10;
export const FATHOM_BACKFILL_ROUTE_PATH = '/fathom/backfill';
export const FATHOM_BACKFILL_MAX_WINDOW_DAYS = 3_650;
export const FATHOM_INITIAL_BACKFILL_DAYS = 31;
export const FATHOM_BACKFILL_BATCH_SIZE = 5;
export const FATHOM_BACKFILL_BATCH_STAGGER_MILLISECONDS = 20_000;
export const FATHOM_BACKFILL_JOB_RETRY_LIMIT = 3;
export const FATHOM_REQUEST_RETRY_MAX_ELAPSED_MILLISECONDS = 10_000;
export const MAX_FATHOM_MEETING_PAGES = 20;
export const MAX_FATHOM_BACKFILL_PAGES = 1_000;
export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;
export const CALL_RECORDING_IDS_PER_QUERY = 200;
export const FATHOM_MEDIA_MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
export const FATHOM_MEDIA_DOWNLOAD_TIMEOUT_MILLISECONDS = 120_000;
export const FATHOM_MEDIA_UPLOAD_TIMEOUT_MILLISECONDS = 14 * 60 * 1_000;
export const FATHOM_MEDIA_FILE_FOLDER = 'FilesField';
// Polls count against Fathom's global 60-per-minute budget, which a backfill
// already spends on transcripts and summaries, so the interval grows instead of
// holding at one poll per minute per recording in flight.
export const FATHOM_MEDIA_DOWNLOAD_INITIAL_POLL_DELAY_MILLISECONDS = 60_000;
export const FATHOM_MEDIA_DOWNLOAD_MAX_POLL_DELAY_MILLISECONDS = 300_000;
export const FATHOM_MEDIA_DOWNLOAD_POLL_BACKOFF_EXPONENT = 1.5;
export const FATHOM_MEDIA_DOWNLOAD_MAX_POLL_ATTEMPTS = 12;
