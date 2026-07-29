// Bounds kept deliberately narrow: these values are supplied by application
// code, and an unbounded delay or retry count would let an app pin work in the
// shared logic function queue for an arbitrarily long time.
export const ENQUEUE_JOB_MIN_RETRY_LIMIT = 0;
export const ENQUEUE_JOB_MAX_RETRY_LIMIT = 10;
export const ENQUEUE_JOB_DEFAULT_RETRY_LIMIT = 0;

export const ENQUEUE_JOB_MIN_PRIORITY = 1;
export const ENQUEUE_JOB_MAX_PRIORITY = 10;

export const ENQUEUE_JOB_MIN_DELAY_MS = 0;
export const ENQUEUE_JOB_MAX_DELAY_MS = 7 * 24 * 60 * 60 * 1000;
