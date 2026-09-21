// Prevent an unbounded loop if Fireflies keeps returning full pages.
export const FIREFLIES_BACKFILL_MAX_PAGE_COUNT = 2_000;
