import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  type BackfillState,
  BACKFILL_STATE_KV_KEY,
} from 'src/constants/backfill';
import { BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { startBackfill } from 'src/utils/advance-backfill';
import {
  getBackfillBatchSize,
  getBackfillSleepMs,
} from 'src/utils/backfill-settings';

const handler = async (): Promise<object> => {
  const existingState = await kv.get<BackfillState>(BACKFILL_STATE_KV_KEY);

  console.log(
    'Backfill params',
    JSON.stringify({
      batchSize: getBackfillBatchSize(),
      sleepMs: getBackfillSleepMs(),
    }),
  );

  if (existingState) {
    return { outcome: 'already-running', state: existingState };
  }

  await startBackfill();

  return { outcome: 'started' };
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_POST_INSTALL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'backfill-last-contact',
  description:
    'Enqueues the sequential last-contact backfill after installation.',
  timeoutSeconds: 60,
  shouldRunOnVersionUpgrade: false,
  handler,
});
