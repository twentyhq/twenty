// Cloudflare drops the connection after 100s and the client then cannot tell
// whether the completion happened. Failing well before that keeps the outcome
// observable, and a retry is safe because completion is idempotent.
export const COMPLETE_FILE_UPLOAD_DEADLINE_MS = 60 * 1000;
