// The callRecording.updated trigger resumes most stuck rows within seconds;
// this cron is the backstop for crashed creations and missed events.
export const PENDING_CALL_RECORDING_REQUESTS_CRON_PATTERN = '0 3 * * *';
