// Below Recall's lowest per-minute bot ceiling (create and list, 120/min for this workspace)
// so one invocation paces itself under the limit; cross-invocation contention is
// still handled by Retry-After and the low-volume webhook/batched architecture.
export const RECALL_API_RATE_LIMIT_PER_MINUTE = 100;

export const RECALL_API_RATE_LIMIT_BURST = 20;
