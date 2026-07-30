export const BACKFILL_PEOPLE_ROUTE_PATH = '/last-contact/backfill-people';
export const BACKFILL_COMPANIES_ROUTE_PATH =
  '/last-contact/backfill-companies';
export const BACKFILL_OPPORTUNITIES_ROUTE_PATH =
  '/last-contact/backfill-opportunities';

// Records handled per invocation before the function re-triggers itself with
// the next cursor.
export const BACKFILL_BATCH_SIZE = 20;

// Paused before re-triggering the next page so update bursts stay under the
// hosted API rate limiting. Temporary until enqueueJob handles throttling.
export const BACKFILL_SLEEP_MS = 2_000;
