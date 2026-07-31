import {
  BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export type BackfillPhase = 'people' | 'opportunities' | 'companies';

export const BACKFILL_PHASE_ORDER: BackfillPhase[] = [
  'people',
  'opportunities',
  'companies',
];

// GraphQL query field exposing the record connection for each phase.
export const BACKFILL_PHASE_QUERY_FIELD: Record<BackfillPhase, string> = {
  people: 'people',
  opportunities: 'opportunities',
  companies: 'companies',
};

// Logic function each phase's batch jobs are enqueued against.
export const BACKFILL_PHASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS: Record<
  BackfillPhase,
  string
> = {
  people: BACKFILL_PEOPLE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  opportunities: BACKFILL_OPPORTUNITIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  companies: BACKFILL_COMPANIES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
};

// A batch job resolves the records it owns from this index and the batch size.
export type BackfillBatchPayload = { batchId: number };

// Server variables, injected into process.env on every execution.
export const BACKFILL_BATCH_SIZE_ENV_VAR_NAME =
  'LAST_CONTACT_BACKFILL_BATCH_SIZE';
export const BACKFILL_SLEEP_MS_ENV_VAR_NAME = 'LAST_CONTACT_BACKFILL_SLEEP_MS';

export const DEFAULT_BACKFILL_BATCH_SIZE = 20;
export const DEFAULT_BACKFILL_SLEEP_MS = 1_000;
