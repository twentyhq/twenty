// Hourly: this sweep is the only safety net for an import pass that never ran,
// so its period is the worst-case time a recording can sit visibly processing.
export const STALE_BOT_STATE_CRON_PATTERN = '30 * * * *';
