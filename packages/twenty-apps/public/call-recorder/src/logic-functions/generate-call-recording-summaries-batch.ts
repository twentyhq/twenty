import { defineLogicFunction } from 'twenty-sdk/define';

import { GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summaries-batch-logic-function-universal-identifier';
import { createRetryingCoreApiClient } from 'src/logic-functions/data/create-retrying-core-api-client.util';
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

  try {
    const result = await generateCallRecordingSummariesForIds({
      client: createRetryingCoreApiClient(),
      callRecordingIds,
    });

    return { outcome: 'processed', ...result };
  } catch (error) {
    throw buildRetryableStepFailure('call recording summaries batch', error);
  }
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
