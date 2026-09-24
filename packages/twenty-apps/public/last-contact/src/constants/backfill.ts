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
