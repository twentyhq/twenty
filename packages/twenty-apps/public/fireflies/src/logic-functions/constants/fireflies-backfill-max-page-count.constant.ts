// This bounds a sweep at 100,000 transcripts and keeps its staggered batches
// within enqueueJob's seven-day scheduling horizon.
export const FIREFLIES_BACKFILL_MAX_PAGE_COUNT = 2_000;
