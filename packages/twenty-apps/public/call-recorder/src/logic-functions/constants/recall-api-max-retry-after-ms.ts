// Caps Retry-After so an oversized header cannot park a request for the whole timeout.
export const RECALL_API_MAX_RETRY_AFTER_MS = 60_000;
