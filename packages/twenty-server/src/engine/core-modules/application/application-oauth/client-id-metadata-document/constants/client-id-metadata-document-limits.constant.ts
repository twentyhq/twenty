export const CLIENT_ID_METADATA_DOCUMENT_LIMITS = {
  // The draft's suggested cap
  maxSizeBytes: 5 * 1024,
  // The fetch runs inside the user's authorize request
  fetchTimeoutMs: 5_000,
  refreshAfterMs: 5 * 60 * 1000,
  // Outlives refreshAfterMs so token refreshes keep working while the host is unreachable
  staleCacheTtlMs: 24 * 60 * 60 * 1000,
} as const;
