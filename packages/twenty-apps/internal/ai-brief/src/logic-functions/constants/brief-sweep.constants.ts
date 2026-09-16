// How far back the synthesizer looks when building a brief.
export const BRIEF_ACTIVITY_WINDOW_DAYS = 90;

// Records per generate job: one record per job keeps agent runs small and
// retryable; the sweep enqueues at most this many targets per night.
export const SWEEP_MAX_TARGETS_PER_RUN = 200;

// A brief older than this is considered stale and gets regenerated even
// without new activity, so relative dates in the brief stay honest.
export const BRIEF_STALE_AFTER_DAYS = 7;
