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

export const DEFAULT_BACKFILL_BATCH_SIZE = 200;
export const DEFAULT_BACKFILL_SLEEP_MS = 1_000;

// Routes the settings panel calls. The server serves app routes under /s.
export const BACKFILL_ROUTE_PATH = '/last-contact/backfill';
export const BACKFILL_STATUS_ROUTE_PATH = '/last-contact/backfill/status';

// Response the backfill route answers with once the run is enqueued.
export const BACKFILL_STARTED_OUTCOME = 'started';

// The latest run, so the settings panel can report on a backfill it did not
// start itself (the post-install hook, or another admin's click).
export const BACKFILL_RUN_KV_KEY = 'backfill-run';

// getJobs rejects reads above this many ids, so a run's jobs are read in pages.
export const MAX_JOB_IDS_PER_STATUS_READ = 200;

export type BackfillPhasePlan = {
  phase: BackfillPhase;
  count: number;
  batches: number;
};

// A run is recorded before its jobs exist, because counting the records and
// enqueueing a job per batch takes long enough for an admin to see the gap.
export type BackfillRun =
  | { status: 'enqueueing'; startedAt: string }
  | {
      status: 'enqueued';
      startedAt: string;
      jobIds: string[];
      plans: BackfillPhasePlan[];
    };

export type BackfillProgress = {
  total: number;
  completed: number;
  failed: number;
  running: number;
  pending: number;
};

export type BackfillStatus =
  | { status: 'idle' }
  | { status: 'enqueueing'; startedAt: string }
  | {
      status: 'running' | 'settled';
      startedAt: string;
      progress: BackfillProgress;
    };
