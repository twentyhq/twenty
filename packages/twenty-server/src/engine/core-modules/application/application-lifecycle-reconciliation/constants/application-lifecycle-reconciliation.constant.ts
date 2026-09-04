export const APPLICATION_LIFECYCLE_RECONCILIATION_CRON_PATTERN = '*/15 * * * *';

export const APPLICATION_LIFECYCLE_RECONCILIATION_BATCH_SIZE = 100;

// Well beyond the slowest realistic install, so a long but healthy operation is
// never declared dead while it is still running.
export const APPLICATION_LIFECYCLE_STUCK_AFTER_MINUTES = 30;
