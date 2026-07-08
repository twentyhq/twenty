// Recall's shared ad-hoc bot pool refills within about 30 seconds, so a 507
// (pool momentarily drained) waits that long before retrying when Recall does not
// send a Retry-After header of its own.
export const RECALL_API_ADHOC_POOL_RETRY_DELAY_MS = 30_000;
