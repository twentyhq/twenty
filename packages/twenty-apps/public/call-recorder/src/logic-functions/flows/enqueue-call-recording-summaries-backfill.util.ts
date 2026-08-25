import { type CoreApiClient } from 'twenty-client-sdk/core';

import { GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summaries-batch-logic-function-universal-identifier';
import { CALL_RECORDING_SUMMARIES_BATCH_SIZE } from 'src/logic-functions/constants/call-recording-summaries-batch-size';
import { enqueueJobsInChunks } from 'src/logic-functions/data/enqueue-jobs-in-chunks.util';
import { findCallRecordingIdsMissingSummary } from 'src/logic-functions/data/find-call-recording-ids-missing-summary.util';
import { getIdBatches } from 'src/logic-functions/utils/get-id-batches.util';

export type EnqueueCallRecordingSummariesBackfillResult = {
  callRecordingCount: number;
  batchCount: number;
};

export const enqueueCallRecordingSummariesBackfill = async ({
  client,
}: {
  client: CoreApiClient;
}): Promise<EnqueueCallRecordingSummariesBackfillResult> => {
  const callRecordingIds = await findCallRecordingIdsMissingSummary(client);

  if (callRecordingIds.length === 0) {
    return { callRecordingCount: 0, batchCount: 0 };
  }

  const callRecordingIdBatches = getIdBatches(
    callRecordingIds,
    CALL_RECORDING_SUMMARIES_BATCH_SIZE,
  );

  await enqueueJobsInChunks({
    logicFunctionUniversalIdentifier:
      GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: callRecordingIdBatches.map((batchCallRecordingIds) => ({
      callRecordingIds: batchCallRecordingIds,
    })),
  });

  return {
    callRecordingCount: callRecordingIds.length,
    batchCount: callRecordingIdBatches.length,
  };
};
