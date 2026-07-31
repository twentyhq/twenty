import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  type BackfillBatchResult,
  type BackfillState,
  BACKFILL_ORCHESTRATOR_ROUTE_PATH,
  BACKFILL_PHASE_ORDER,
  BACKFILL_PHASE_ROUTE_PATHS,
  BACKFILL_STATE_KV_KEY,
} from 'src/constants/backfill';
import { BACKFILL_ORCHESTRATOR_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getBackfillSleepMs } from 'src/utils/backfill-settings';
import { callOwnRoute, postToOwnRoute, sleep } from 'src/utils/post-to-own-route';

const MAX_ITERATIONS = 10_000;

const handler = async (): Promise<object> => {
  const state = await kv.get<BackfillState>(BACKFILL_STATE_KV_KEY);

  if (!state) {
    return { outcome: 'no-active-backfill' };
  }

  if (state.iterations > MAX_ITERATIONS) {
    return { outcome: 'max-iteration-reached' };
  }

  const { nextCursor } = await callOwnRoute<BackfillBatchResult>({
    path: BACKFILL_PHASE_ROUTE_PATHS[state.phase],
    body: { cursor: state.cursor ?? undefined },
  });

  await sleep(getBackfillSleepMs());

  if (nextCursor) {
    await kv.set<BackfillState>(BACKFILL_STATE_KV_KEY, {
      phase: state.phase,
      cursor: nextCursor,
      iterations: (state.iterations ?? 0) + 1,
    });
    await postToOwnRoute({ path: BACKFILL_ORCHESTRATOR_ROUTE_PATH, body: {} });

    return { outcome: 'continued', phase: state.phase };
  }

  const nextPhase =
    BACKFILL_PHASE_ORDER[BACKFILL_PHASE_ORDER.indexOf(state.phase) + 1];

  if (nextPhase) {
    await kv.set<BackfillState>(BACKFILL_STATE_KV_KEY, {
      phase: nextPhase,
      cursor: null,
      iterations: (state.iterations ?? 0) + 1,
    });
    await postToOwnRoute({ path: BACKFILL_ORCHESTRATOR_ROUTE_PATH, body: {} });

    return { outcome: 'phase-complete', phase: state.phase, nextPhase };
  }

  await kv.delete(BACKFILL_STATE_KV_KEY);

  return { outcome: 'done' };
};

export default defineLogicFunction({
  universalIdentifier:
    BACKFILL_ORCHESTRATOR_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-orchestrator',
  description:
    'Sequentially drives the people, opportunity and company last-contact backfills, tracking phase and cursor in the kv-store and re-triggering itself until every phase is complete.',
  timeoutSeconds: 150,
  handler,
  httpRouteTriggerSettings: {
    path: BACKFILL_ORCHESTRATOR_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
