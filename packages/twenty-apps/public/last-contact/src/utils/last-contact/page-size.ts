export const PAGE_SIZE = 200;

// Kept low so update bursts stay under Cloudflare rate limiting on hosted
// workspaces; executeWithRetry absorbs the occasional 429 that still slips
// through.
export const UPDATE_BATCH_SIZE = 10;
