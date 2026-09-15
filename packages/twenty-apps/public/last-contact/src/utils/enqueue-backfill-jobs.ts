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

// Batch handlers are idempotent (they recompute from source and overwrite), so
// a batch that dies mid-run can safely be retried by the queue rather than
// leaving its records unbackfilled.
const BACKFILL_JOB_RETRY_LIMIT = 3;

type BackfillPhasePlan = { phase: BackfillPhase; count: number; batches: number };

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
  let enqueuedCount = 0;

  for (const phase of BACKFILL_PHASE_ORDER) {
    const count = await countPhaseRecords(client, phase);
    const batches = Math.ceil(count / batchSize);

    for (let batchId = 0; batchId < batches; batchId++) {
      await enqueueJob({
        logicFunctionUniversalIdentifier:
          BACKFILL_PHASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS[phase],
        payload: { batchId },
        delayMs: Math.min(enqueuedCount * sleepMs, MAX_ENQUEUE_DELAY_MS),
        retryLimit: BACKFILL_JOB_RETRY_LIMIT,
      });
      enqueuedCount++;
    }

    plans.push({ phase, count, batches });
  }

  return plans;
};
