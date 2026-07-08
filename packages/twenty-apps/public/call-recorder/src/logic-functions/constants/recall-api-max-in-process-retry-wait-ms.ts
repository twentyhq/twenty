// A retry whose backoff would block the invocation longer than this is deferred
// to the reconcilers (stale-state cron, sweeps) instead of slept on, so a long
// Retry-After or ad-hoc pool wait cannot burn a whole logic-function budget.
// Kept well under the tightest budget, the 60s reactive reconcile path, and
// above the transient linear backoff so blips still retry in-process.
export const RECALL_API_MAX_IN_PROCESS_RETRY_WAIT_MS = 10_000;
