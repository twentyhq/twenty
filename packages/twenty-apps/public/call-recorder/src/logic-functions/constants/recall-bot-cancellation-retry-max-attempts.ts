// 5 escalating rungs (~12.6h) plus repeated 10h rungs must outlast the 7-day
// bot scheduling horizon, so a destroyed row's bot is retried until it is
// terminal even when no local marker survives to re-trigger cleanup.
export const RECALL_BOT_CANCELLATION_RETRY_MAX_ATTEMPTS = 21;
