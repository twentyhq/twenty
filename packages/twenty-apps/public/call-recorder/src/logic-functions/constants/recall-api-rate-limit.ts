// Below Recall's lowest per-minute bot ceiling (create, 120/min) so one invocation
// paces itself under the limit; cross-invocation contention is handled by Retry-After.
export const RECALL_API_RATE_LIMIT_PER_MINUTE = 100;

export const RECALL_API_RATE_LIMIT_BURST = 20;
