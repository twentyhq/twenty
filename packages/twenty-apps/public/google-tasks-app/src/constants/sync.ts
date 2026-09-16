export const GOOGLE_TASKS_CONNECTION_PROVIDER_NAME = 'google-tasks';
export const GOOGLE_TASKS_BASE_API_URL = 'https://tasks.googleapis.com';
export const GOOGLE_TASKS_REQUEST_TIMEOUT_MS = 10_000;
export const GOOGLE_TASKS_PAGE_SIZE = 100;
export const GOOGLE_TASKS_DEFAULT_LIST_ID = '@default';
export const TASKS_BATCH_SIZE = 200;
export const MAX_JOBS_PER_ENQUEUE = 200;
// The queue does not retry enqueued jobs unless asked to, and the platform caps
// application retries at 3.
export const SYNC_TASKS_JOB_RETRY_LIMIT = 3;
export const UPDATE_CONCURRENCY = 10;
export const PUSH_CONCURRENCY = 5;
export const PUSH_TASKS_ROUTE_PATH = '/push-google-tasks';
