// Recall caps GET /bot/{id} at 300/min for the whole account, shared by every
// workspace and by webhook-driven work, so one workspace's recovery takes a slice.
// Job delays are lower bounds, so this paces recovery rather than capping it.
export const RECALL_RECOVERY_CALLS_PER_MINUTE = 60;
