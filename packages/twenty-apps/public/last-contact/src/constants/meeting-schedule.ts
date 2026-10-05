export const MEETING_SLOT_MS = 15 * 60 * 1000;

// Absorbs clock skew so the last meeting of a slot has started when its job
// reads it.
export const MEETING_SLOT_JOB_DELAY_BUFFER_MS = 60 * 1000;

// Enqueued jobs can be delayed by at most 7 days. Meetings within the horizon
// get their slot job right away; later ones are reached by a horizon job that
// runs every period and schedules the next horizon, for as long as meetings
// remain beyond it.
export const MEETING_HORIZON_PERIOD_MS = 3 * 24 * 60 * 60 * 1000;

export const MEETING_SCHEDULE_HORIZON_MS = 2 * MEETING_HORIZON_PERIOD_MS;

// Covers meetings that started between the last run of the calendar cron that
// versions before 1.8.0 used and the upgrade.
export const MEETING_INSTALL_LOOKBACK_MS = 60 * 60 * 1000;

export const MEETING_JOB_RETRY_LIMIT = 3;
