// Keeps a single function invocation's outbound Recall calls under the documented
// per-minute ceilings (create 120/min, retrieve 300/min) so a large sweep or
// reconcile batch cannot burst into 429s. One bucket paces every bot call, so it
// is sized below the lowest relevant limit. It does not coordinate across
// concurrent invocations; Retry-After handling covers that cooperatively.
export const RECALL_API_RATE_LIMIT_PER_MINUTE = 100;

// Allows a small burst before pacing kicks in, so low-volume runs are never slowed.
export const RECALL_API_RATE_LIMIT_BURST = 20;
