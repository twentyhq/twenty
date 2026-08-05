import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summary-job-logic-function-universal-identifier';
import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

// Generation errors propagate so the queue retries the job; deterministic
// outcomes (disabled toggle, empty summary, already summarized) return
// normally because retrying cannot change them.
export const generateCallRecordingSummaryJobHandler = async (
  payload: { callRecordingId?: unknown } | null | undefined,
): Promise<object> => {
  const callRecordingId = getString(payload?.callRecordingId);

  if (isUndefined(callRecordingId)) {
    return {
      outcome: 'skipped',
      reason: 'invalid call recording summary job payload',
    };
  }

  const result = await generateCallRecordingSummary(new CoreApiClient(), {
    callRecordingId,
  });

  return { callRecordingId, ...result };
};

export default defineLogicFunction({
  universalIdentifier:
    GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'generate-call-recording-summary-job',
  description:
    'Generates the AI summary for one call recording as an enqueued job with queue retries.',
  timeoutSeconds: 60 * 4,
  handler: generateCallRecordingSummaryJobHandler,
});
