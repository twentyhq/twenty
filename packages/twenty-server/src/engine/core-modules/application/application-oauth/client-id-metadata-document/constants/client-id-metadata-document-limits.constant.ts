// The draft suggests capping documents at 5 KB; the fetch runs inside the user's authorize request.
// A document older than refreshAfterMs is fetched again, but kept while its host is unreachable so token refreshes keep working.
export const CLIENT_ID_METADATA_DOCUMENT_LIMITS = {
  maxSizeBytes: 5 * 1024,
  fetchTimeoutMs: 5_000,
  refreshAfterMs: 5 * 60 * 1000,
  staleCacheTtlMs: 24 * 60 * 60 * 1000,
} as const;
