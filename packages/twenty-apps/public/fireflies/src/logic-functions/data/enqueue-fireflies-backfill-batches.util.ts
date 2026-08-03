import { enqueueJob } from 'twenty-sdk/logic-function';

import { FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-batch-retry-limit.constant';
import { FIREFLIES_BACKFILL_MAX_BATCH_DELAY_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-max-batch-delay-milliseconds.constant';
import { FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/fireflies-backfill-batch-stagger-milliseconds.constant';
import { type EnqueueFirefliesBackfillBatchesResult } from 'src/logic-functions/types/enqueue-fireflies-backfill-batches-result.type';

export const enqueueFirefliesBackfillBatches = async ({
  transcriptIdBatches,
}: {
  transcriptIdBatches: string[][];
}): Promise<EnqueueFirefliesBackfillBatchesResult> => {
  for (const [batchIndex, transcriptIds] of transcriptIdBatches.entries()) {
    try {
      await enqueueJob({
        logicFunctionUniversalIdentifier:
          FIREFLIES_BACKFILL_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        payload: { transcriptIds },
        retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
        delayMs: Math.min(
          batchIndex * FIREFLIES_BACKFILL_BATCH_STAGGER_MILLISECONDS,
          FIREFLIES_BACKFILL_MAX_BATCH_DELAY_MILLISECONDS,
        ),
      });
    } catch (error) {
      return {
        success: false,
        enqueuedBatchCount: batchIndex,
        errorMessage: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    success: true,
    enqueuedBatchCount: transcriptIdBatches.length,
  };
};
