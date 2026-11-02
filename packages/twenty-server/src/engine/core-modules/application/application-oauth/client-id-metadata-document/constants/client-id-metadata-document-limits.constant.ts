export const CLIENT_ID_METADATA_DOCUMENT_LIMITS = {
  // The OAuth Client ID Metadata Document draft's suggested cap
  maxSizeBytes: 5 * 1024,
  // The fetch can run inside the consent query, authorize, and the token, revoke and introspect requests
  fetchTimeoutMs: 5_000,
  refreshAfterMs: 5 * 60 * 1000,
  // Longest the last good document is served after its fetch, so token refreshes survive an outage
  staleCacheTtlMs: 24 * 60 * 60 * 1000,
} as const;
