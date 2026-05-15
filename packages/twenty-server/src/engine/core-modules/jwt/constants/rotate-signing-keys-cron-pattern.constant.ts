/* @license Enterprise */

// Daily at 03:15 UTC. The job is a no-op until the current key reaches the
// SIGNING_KEY_ROTATION_DAYS threshold, so a daily tick is cheap and avoids
// drift if the worker restarts.
export const ROTATE_SIGNING_KEYS_CRON_PATTERN = '15 3 * * *';
