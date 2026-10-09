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

export const BACKFILL_MIN_CALL_INTERVAL_MS = 600;

export const BACKFILL_RUN_BUDGET_MS = 8 * 60 * 1000;

export const BACKFILL_RATE_LIMITED_RESUME_DELAY_MS = 2 * 60 * 1000;

export const BACKFILL_MAX_STALLED_RUNS = 5;
