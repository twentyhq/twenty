// Sanity-bounds a parsed Retry-After so an oversized header cannot flow through
// as an absurd delay; whether that wait is slept on or deferred is decided
// against RECALL_API_MAX_IN_PROCESS_RETRY_WAIT_MS.
export const RECALL_API_MAX_RETRY_AFTER_MS = 60_000;
