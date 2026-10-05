export const MEETING_SLOT_MS = 15 * 60 * 1000;

// Delayed jobs are capped at 7 days; meetings further out are picked up by a
// later sweep.
export const MEETING_SCHEDULE_HORIZON_MS = 48 * 60 * 60 * 1000;

// Absorbs clock skew so the last meeting of a slot has started when its job
// reads it.
export const MEETING_SLOT_JOB_DELAY_BUFFER_MS = 60 * 1000;

// Sweeps of a workspace run 24 hours apart, the extra hour absorbs cron drift.
export const MEETING_SWEEP_LOOKBACK_MS = 25 * 60 * 60 * 1000;

export const MEETING_SWEEP_CRON_PATTERN = '0 0 * * *';

export const MEETING_SWEEP_DISTRIBUTION_WINDOW_MS = 24 * 60 * 60 * 1000;

export const MEETING_SWEEP_INSTALL_DISTRIBUTION_WINDOW_MS = 60 * 60 * 1000;

export const MEETING_JOB_RETRY_LIMIT = 3;
