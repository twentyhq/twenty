// Each synced call costs ~2 Fireflies GraphQL requests (transcript fetch +
// summary fetch); pausing after every per-field sync keeps the sweep around
// one Fireflies request per second, well under the API rate limits.
export const FIREFLIES_BACKFILL_PACING_MS = 1_000;
