import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  type BackfillState,
  BACKFILL_STATE_KV_KEY,
} from 'src/constants/backfill';

const handler = async ({ clear = false }: { clear: boolean }) => {
  const existingState = await kv.get<BackfillState>(BACKFILL_STATE_KV_KEY);

  if (clear) {
    await kv.delete(BACKFILL_STATE_KV_KEY);
  }

  return { state: existingState, deleted: clear };
};

export default defineLogicFunction({
  universalIdentifier: '6d8f9d22-61db-4865-8de2-9512c5d63b5d',
  name: 'backfill-get-state',
  description: 'Add a description for your logic function',
  timeoutSeconds: 5,
  handler,
});
