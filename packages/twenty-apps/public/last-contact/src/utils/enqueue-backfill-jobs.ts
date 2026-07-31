import { type CoreApiClient } from 'twenty-client-sdk/core';
import { enqueueJob } from 'twenty-sdk/logic-function';

import {
  type BackfillPhase,
  BACKFILL_PHASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS,
  BACKFILL_PHASE_ORDER,
  BACKFILL_PHASE_QUERY_FIELD,
} from 'src/constants/backfill';
import {
  getBackfillBatchSize,
  getBackfillSleepMs,
} from 'src/utils/backfill-settings';
import { executeWithRetry } from 'src/utils/execute-with-retry';

// enqueueJob rejects delays beyond 7 days.
const MAX_ENQUEUE_DELAY_MS = 7 * 24 * 60 * 60 * 1_000;
const ENQUEUE_CONCURRENCY = 20;

type BackfillPhasePlan = { phase: BackfillPhase; count: number; batches: number };
type BackfillJob = { phase: BackfillPhase; batchId: number; delayMs: number };

const countPhaseRecords = async (
  client: CoreApiClient,
  phase: BackfillPhase,
): Promise<number> => {
  const field = BACKFILL_PHASE_QUERY_FIELD[phase];

  const result = await executeWithRetry(() =>
    client.query({ [field]: { __args: { first: 1 }, totalCount: true } }),
  );

  return result?.[field]?.totalCount ?? 0;
};

// Counts every phase, then enqueues one job per record batch across all phases.
// Jobs are spaced by delayMs so thousands of batches do not all become eligible
// at once and overwhelm the API rate limiting.
export const enqueueBackfillJobs = async (
  client: CoreApiClient,
): Promise<BackfillPhasePlan[]> => {
  const batchSize = getBackfillBatchSize();
  const sleepMs = getBackfillSleepMs();

  const plans: BackfillPhasePlan[] = [];
  const jobs: BackfillJob[] = [];

  for (const phase of BACKFILL_PHASE_ORDER) {
    const count = await countPhaseRecords(client, phase);
    const batches = Math.ceil(count / batchSize);

    for (let batchId = 0; batchId < batches; batchId++) {
      jobs.push({
        phase,
        batchId,
        delayMs: Math.min(jobs.length * sleepMs, MAX_ENQUEUE_DELAY_MS),
      });
    }

    plans.push({ phase, count, batches });
  }

  for (let start = 0; start < jobs.length; start += ENQUEUE_CONCURRENCY) {
    await Promise.all(
      jobs.slice(start, start + ENQUEUE_CONCURRENCY).map((job) =>
        enqueueJob({
          logicFunctionUniversalIdentifier:
            BACKFILL_PHASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS[job.phase],
          payload: { batchId: job.batchId },
          delayMs: job.delayMs,
        }),
      ),
    );
  }

  return plans;
};
