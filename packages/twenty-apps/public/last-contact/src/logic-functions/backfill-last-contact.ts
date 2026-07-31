import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  type BackfillState,
  BACKFILL_ORCHESTRATOR_ROUTE_PATH,
  BACKFILL_PHASE_ORDER,
  BACKFILL_STATE_KV_KEY,
} from 'src/constants/backfill';
import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { postToOwnRoute } from 'src/utils/post-to-own-route';
import { getBackfillBatchSize, getBackfillSleepMs } from 'src/utils/backfill-settings';

const handler = async (): Promise<object> => {
  const existingState = await kv.get<BackfillState>(BACKFILL_STATE_KV_KEY);

  console.log('Backfill params', JSON.stringify({ batchSize: getBackfillBatchSize(), sleepMs: getBackfillSleepMs() }));

  if (existingState) {
    return { outcome: 'already-running', state: existingState };
  }

  await kv.set<BackfillState>(BACKFILL_STATE_KV_KEY, {
    phase: BACKFILL_PHASE_ORDER[0],
    cursor: null,
    iterations: 0,
  });

  await postToOwnRoute({ path: BACKFILL_ORCHESTRATOR_ROUTE_PATH, body: {} });

  return { outcome: 'started' };
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Starts the sequential last-contact backfill orchestrator after installation.',
  timeoutSeconds: 60,
  shouldRunOnVersionUpgrade: false,
  handler,
});
