// Redelivery is safe only because every enqueued handler is idempotent.
export const ENQUEUED_JOB_RETRY_LIMIT = 2;
