// Local, endpoint-scoped burst smoothing. This matches the current Recall bot
// read/create ceiling for this shared key; Retry-After remains the source of
// truth for real fleet-wide throttling.
export const RECALL_API_ENDPOINT_RATE_LIMIT_PER_MINUTE = 120;

export const RECALL_API_ENDPOINT_RATE_LIMIT_BURST = 20;
