// Daily cleanup of bots scheduled beyond the horizon (e.g. before the horizon shipped).
// The daily sweep re-creates a fresh bot when the meeting re-enters the horizon.
export const BEYOND_HORIZON_CALL_RECORDING_CANCELLATION_CRON_PATTERN =
  '30 4 * * *';
