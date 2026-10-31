// The draft suggests capping documents at 5 KB; the fetch runs inside the user's authorize request
export const CLIENT_ID_METADATA_DOCUMENT_LIMITS = {
  maxSizeBytes: 5 * 1024,
  fetchTimeoutMs: 5_000,
  cacheTtlMs: 5 * 60 * 1000,
} as const;
