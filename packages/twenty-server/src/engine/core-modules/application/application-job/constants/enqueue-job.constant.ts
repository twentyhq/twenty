export const ENQUEUE_JOB_MIN_RETRY_LIMIT = 0;
export const ENQUEUE_JOB_MAX_RETRY_LIMIT = 10;
export const ENQUEUE_JOB_DEFAULT_RETRY_LIMIT = 0;

export const ENQUEUE_JOB_PRIORITY = 10;

export const ENQUEUE_JOB_MIN_DELAY_MS = 0;
export const ENQUEUE_JOB_MAX_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

export const MAX_JOBS_PER_ENQUEUE = 200;

export const ENQUEUE_JOB_ID_MIN_LENGTH = 1;
export const ENQUEUE_JOB_ID_MAX_LENGTH = 128;
export const ENQUEUE_JOB_ID_PATTERN = /^[\w.-]+$/;

export const MAX_JOBS_PER_STATUS_READ = 200;
