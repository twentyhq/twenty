export const MILLISECONDS_PER_HOUR = 60 * 60 * 1_000;
export const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;
// A call still running at one daily run can have started 24 hours earlier, and the next run is up to 25 hours later.
export const GOOGLE_MEET_RECENT_CONFERENCE_WINDOW_MILLISECONDS =
  50 * MILLISECONDS_PER_HOUR;
export const GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE = 200;
export const GOOGLE_MEET_DAILY_JOB_SPREAD_MILLISECONDS = MILLISECONDS_PER_HOUR;
