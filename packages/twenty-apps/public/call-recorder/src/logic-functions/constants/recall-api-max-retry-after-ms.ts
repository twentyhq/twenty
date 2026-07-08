// Caps how long a Retry-After can park a request so an oversized header cannot
// stall a function for its whole timeout.
export const RECALL_API_MAX_RETRY_AFTER_MS = 60_000;
