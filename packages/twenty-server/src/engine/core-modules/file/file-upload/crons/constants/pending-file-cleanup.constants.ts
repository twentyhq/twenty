export const PENDING_FILE_CLEANUP_CRON_PATTERN = '0 * * * *';

// A pending file only becomes reapable long after its upload URL has expired,
// so the cleanup can never race a legitimate in-flight upload.
export const PENDING_FILE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const PENDING_FILE_CLEANUP_BATCH_SIZE = 200;
