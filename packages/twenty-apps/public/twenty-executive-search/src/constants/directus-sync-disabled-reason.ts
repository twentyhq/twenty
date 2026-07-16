// Sync remains disabled until the PR4 exit gate.
// Returned by get-directus-api-config when DIRECTUS_URL or DIRECTUS_API_KEY is unset.
export const DIRECTUS_SYNC_DISABLED_REASON =
  'Directus sync is not configured. A server admin must set DIRECTUS_URL and DIRECTUS_API_KEY.';
