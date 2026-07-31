import { FIREFLIES_BACKFILL_BATCH_SIZE } from 'src/logic-functions/constants/fireflies-backfill-batch-size.constant';
import { FIREFLIES_BACKFILL_OUTCOME } from 'src/logic-functions/constants/fireflies-backfill-outcome.constant';
import { enqueueFirefliesBackfillBatches } from 'src/logic-functions/data/enqueue-fireflies-backfill-batches.util';
import { type FirefliesBackfillResult } from 'src/logic-functions/types/fireflies-backfill-result.type';
import { buildFirefliesBackfillWindow } from 'src/logic-functions/utils/build-fireflies-backfill-window.util';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';
import { listFirefliesTranscriptIds } from 'src/logic-functions/utils/list-fireflies-transcript-ids.util';
import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';

export const firefliesBackfillHandler = async ({
  windowDays,
}: {
  windowDays: number;
}): Promise<FirefliesBackfillResult> => {
  const apiKeyResult = getFirefliesApiKey();

  if (!apiKeyResult.success) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.NOT_CONFIGURED,
      error: apiKeyResult.error,
    };
  }

  const { fromDate, toDate } = buildFirefliesBackfillWindow({
    windowDays,
    nowMilliseconds: Date.now(),
  });

  const listFirefliesTranscriptIdsResult = await listFirefliesTranscriptIds({
    apiKey: apiKeyResult.apiKey,
    fromDate,
    toDate,
  });

  if (!listFirefliesTranscriptIdsResult.ok) {
    return {
      outcome: FIREFLIES_BACKFILL_OUTCOME.LIST_FAILED,
      fromDate,
      toDate,
      error: listFirefliesTranscriptIdsResult.errorMessage,
    };
  }

  const transcriptIdBatches = chunkIntoBatches(
    listFirefliesTranscriptIdsResult.transcriptIds,
    FIREFLIES_BACKFILL_BATCH_SIZE,
  );
  await enqueueFirefliesBackfillBatches({ transcriptIdBatches });

  return {
    outcome: FIREFLIES_BACKFILL_OUTCOME.STARTED,
    fromDate,
    toDate,
    transcriptCount: listFirefliesTranscriptIdsResult.transcriptIds.length,
    batchCount: transcriptIdBatches.length,
  };
};
