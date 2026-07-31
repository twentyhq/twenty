import { enqueueJob, kv } from 'twenty-sdk/logic-function';

import {
  type BackfillPhase,
  type BackfillState,
  BACKFILL_PHASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS,
  BACKFILL_PHASE_ORDER,
  BACKFILL_STATE_KV_KEY,
  MAX_BACKFILL_ITERATIONS,
} from 'src/constants/backfill';
import { getBackfillSleepMs } from 'src/utils/backfill-settings';

// The delay keeps consecutive batches under the API rate limit, replacing the
// blocking sleep the orchestrator used between self-calls.
const enqueuePhaseBatch = async (phase: BackfillPhase): Promise<void> => {
  await enqueueJob({
    logicFunctionUniversalIdentifier:
      BACKFILL_PHASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS[phase],
    delayMs: getBackfillSleepMs(),
  });
};

// Persists progress and enqueues the next backfill batch: another page of the
// current phase, the first page of the following phase, or nothing once every
// phase is exhausted.
export const advanceBackfill = async ({
  phase,
  nextCursor,
  iterations,
}: {
  phase: BackfillPhase;
  nextCursor: string | null;
  iterations: number;
}): Promise<object> => {
  if (iterations >= MAX_BACKFILL_ITERATIONS) {
    await kv.delete(BACKFILL_STATE_KV_KEY);

    return { outcome: 'max-iteration-reached' };
  }

  if (nextCursor) {
    await kv.set<BackfillState>(BACKFILL_STATE_KV_KEY, {
      phase,
      cursor: nextCursor,
      iterations: iterations + 1,
    });
    await enqueuePhaseBatch(phase);

    return { outcome: 'continued', phase };
  }

  const nextPhase =
    BACKFILL_PHASE_ORDER[BACKFILL_PHASE_ORDER.indexOf(phase) + 1];

  if (nextPhase) {
    await kv.set<BackfillState>(BACKFILL_STATE_KV_KEY, {
      phase: nextPhase,
      cursor: null,
      iterations: iterations + 1,
    });
    await enqueuePhaseBatch(nextPhase);

    return { outcome: 'phase-complete', phase, nextPhase };
  }

  await kv.delete(BACKFILL_STATE_KV_KEY);

  return { outcome: 'done' };
};

// Seeds fresh backfill state and enqueues the first phase.
export const startBackfill = async (): Promise<void> => {
  await kv.set<BackfillState>(BACKFILL_STATE_KV_KEY, {
    phase: BACKFILL_PHASE_ORDER[0],
    cursor: null,
    iterations: 0,
  });
  await enqueuePhaseBatch(BACKFILL_PHASE_ORDER[0]);
};
