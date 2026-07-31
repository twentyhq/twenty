import { enqueueJob } from 'twenty-sdk/logic-function';

import { FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/fireflies-backfill-batch-logic-function-universal-identifier.constant';
import { FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-batch-retry-limit.constant';
import { FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-batch-stagger-milliseconds.constant';

export const enqueueFirefliesBackfillBatches = async ({
  transcriptIdBatches,
}: {
  transcriptIdBatches: string[][];
}): Promise<void> => {
  for (const [batchIndex, transcriptIds] of transcriptIdBatches.entries()) {
    await enqueueJob({
      logicFunctionUniversalIdentifier:
        FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { transcriptIds },
      retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
      delayMs: batchIndex * FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS,
    });
  }
};
