// How long a run waits after a Fireflies HTTP 429 before firing its
// continuation, so the self-invoke chain cannot hammer a rate-limited API.
export const FIREFLIES_BACKFILL_RATE_LIMIT_PAUSE_MS = 60_000;
