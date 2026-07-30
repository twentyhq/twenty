export const BACKFILL_ORCHESTRATOR_ROUTE_PATH =
  '/last-contact/backfill-orchestrator';
export const BACKFILL_PEOPLE_ROUTE_PATH = '/last-contact/backfill-people';
export const BACKFILL_OPPORTUNITIES_ROUTE_PATH =
  '/last-contact/backfill-opportunities';
export const BACKFILL_COMPANIES_ROUTE_PATH =
  '/last-contact/backfill-companies';

export type BackfillPhase = 'people' | 'opportunities' | 'companies';

// People run first so companies and opportunities can read the freshly
// computed person last-contact, then opportunities, then companies.
export const BACKFILL_PHASE_ORDER: BackfillPhase[] = [
  'people',
  'opportunities',
  'companies',
];

export const BACKFILL_PHASE_ROUTE_PATHS: Record<BackfillPhase, string> = {
  people: BACKFILL_PEOPLE_ROUTE_PATH,
  opportunities: BACKFILL_OPPORTUNITIES_ROUTE_PATH,
  companies: BACKFILL_COMPANIES_ROUTE_PATH,
};

export type BackfillState = { phase: BackfillPhase; cursor: string | null };
export type BackfillBatchResult = { nextCursor: string | null; count: number };

// Presence of this key acts as the backfill lock; it is deleted once every
// phase has completed.
export const BACKFILL_STATE_KV_KEY = 'last-contact:backfill-state';

// Server variables, injected into process.env on every execution.
export const BACKFILL_BATCH_SIZE_ENV_VAR_NAME =
  'LAST_CONTACT_BACKFILL_BATCH_SIZE';
export const BACKFILL_SLEEP_MS_ENV_VAR_NAME =
  'LAST_CONTACT_BACKFILL_SLEEP_MS';

export const DEFAULT_BACKFILL_BATCH_SIZE = 20;
export const DEFAULT_BACKFILL_SLEEP_MS = 2_000;
