import {
  BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export type BackfillPhase = 'people' | 'opportunities' | 'companies';

// People run first so companies and opportunities can read the freshly
// computed person last-contact, then opportunities, then companies.
export const BACKFILL_PHASE_ORDER: BackfillPhase[] = [
  'people',
  'opportunities',
  'companies',
];

// Each phase is driven by its own enqueued logic function; a phase enqueues
// the next batch of itself, then hands off to the following phase.
export const BACKFILL_PHASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS: Record<
  BackfillPhase,
  string
> = {
  people: BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  opportunities: BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  companies: BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
};

export type BackfillState = {
  phase: BackfillPhase;
  cursor: string | null;
  iterations: number;
};

// Presence of this key acts as the backfill lock; it is deleted once every
// phase has completed.
export const BACKFILL_STATE_KV_KEY = 'last-contact:backfill-state';

// Safety valve against an unbounded enqueue chain.
export const MAX_BACKFILL_ITERATIONS = 10_000;

// Server variables, injected into process.env on every execution.
export const BACKFILL_BATCH_SIZE_ENV_VAR_NAME =
  'LAST_CONTACT_BACKFILL_BATCH_SIZE';
export const BACKFILL_SLEEP_MS_ENV_VAR_NAME = 'LAST_CONTACT_BACKFILL_SLEEP_MS';

export const DEFAULT_BACKFILL_BATCH_SIZE = 20;
export const DEFAULT_BACKFILL_SLEEP_MS = 1_000;
