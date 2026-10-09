// Safety net only: a batch covers at most 100 meetings, which normally hold a
// recording or two each. Past this, a batch keeps its live calls and its
// latest-started recordings, which is what the widget shows first anyway.
export const CALL_RECORDINGS_WIDGET_MAX_CALL_RECORDINGS_PER_BATCH = 500;
