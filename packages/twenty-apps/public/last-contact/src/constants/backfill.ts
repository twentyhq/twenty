export type BackfillPhase = 'people' | 'opportunities' | 'companies';

export const BACKFILL_PHASE_ORDER: BackfillPhase[] = [
  'people',
  'opportunities',
  'companies',
];

// Server variables, injected into process.env on every execution.
export const BACKFILL_BATCH_SIZE_ENV_VAR_NAME =
  'LAST_CONTACT_BACKFILL_BATCH_SIZE';

export const DEFAULT_BACKFILL_BATCH_SIZE = 200;

// 100 calls per minute, a fifth of the 500 calls per minute every install of
// the app shares, so one workspace's backfill cannot starve the others.
export const BACKFILL_MIN_CALL_INTERVAL_MS = 600;

// Stops picking up batches early enough for the batch in flight to finish
// within the function's 900-second timeout.
export const BACKFILL_RUN_BUDGET_MS = 8 * 60 * 1000;

export const BACKFILL_RATE_LIMITED_RESUME_DELAY_MS = 2 * 60 * 1000;

// A run that stalls on a batch retries it for about 2 minutes and the next run
// starts 2 minutes later, so a batch that keeps failing stops the backfill
// after about 20 minutes instead of being retried forever.
export const BACKFILL_MAX_STALLED_RUNS = 5;
