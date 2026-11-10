export const CLIENT_ID_METADATA_DOCUMENT_LIMITS = {
  maxSizeBytes: 5 * 1024,
  fetchTimeoutMs: 5_000,
  refreshAfterMs: 5 * 60 * 1000,
  staleCacheTtlMs: 24 * 60 * 60 * 1000,
} as const;
