// Convergence is a fallback for webhooks that never arrived, so it runs far less
// often than the 5-minute heal/reap cron and leans on the token bucket for pacing.
export const DIVERGED_CALL_RECORDING_CONVERGENCE_CRON_PATTERN = '*/15 * * * *';
