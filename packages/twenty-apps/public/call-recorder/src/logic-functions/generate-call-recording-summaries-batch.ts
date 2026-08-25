import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summaries-batch-logic-function-universal-identifier';
import { generateCallRecordingSummariesForIds } from 'src/logic-functions/flows/generate-call-recording-summaries-for-ids.util';
import { type GenerateCallRecordingSummariesForIdsResult } from 'src/logic-functions/flows/generate-call-recording-summaries-for-ids-result.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { toIdList } from 'src/logic-functions/utils/to-id-list.util';

type GenerateCallRecordingSummariesBatchResult =
  | { outcome: 'nothing-selected' }
  | ({ outcome: 'processed' } & GenerateCallRecordingSummariesForIdsResult);

export const generateCallRecordingSummariesBatchHandler = async (
  payload: unknown,
): Promise<GenerateCallRecordingSummariesBatchResult> => {
  const callRecordingIds = toIdList(asRecord(payload)?.callRecordingIds);

  if (callRecordingIds.length === 0) {
    return { outcome: 'nothing-selected' };
  }

  let result: GenerateCallRecordingSummariesForIdsResult;

  try {
    result = await generateCallRecordingSummariesForIds({
      client: new CoreApiClient(),
      callRecordingIds,
    });
  } catch (error) {
    throw buildRetryableStepFailure('call recording summaries batch', error);
  }

  if (result.erroredCallRecordingIds.length > 0) {
    // Returning normally would mark the job succeeded and skip redelivery, so
    // generation errors must surface as a retryable failure; recordings that
    // already got a summary short-circuit as already-summarized on the re-run.
    throw buildRetryableStepFailure(
      'call recording summaries batch',
      new Error(
        `summary generation errored for ${result.erroredCallRecordingIds.length} of ${callRecordingIds.length} call recordings`,
      ),
    );
  }

  return { outcome: 'processed', ...result };
};

export default defineLogicFunction({
  universalIdentifier:
    GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'generate-call-recording-summaries-batch',
  description:
    'Generates AI summaries for one enqueued batch of call recordings.',
  timeoutSeconds: 900,
  handler: generateCallRecordingSummariesBatchHandler,
});
