import { kv } from 'twenty-sdk/logic-function';

import { type BackfillRun, BACKFILL_RUN_KV_KEY } from 'src/constants/backfill';

export const recordBackfillRun = async (run: BackfillRun): Promise<void> => {
  await kv.set(BACKFILL_RUN_KV_KEY, run);
};
