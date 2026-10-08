import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueCallRecordingRequestFollowUps } from 'src/logic-functions/data/enqueue-call-recording-request-follow-ups.util';
import { findStuckCallRecordingRequestIds } from 'src/logic-functions/data/find-stuck-call-recording-request-ids.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

export const processPendingCallRecordingRequestsHandler = async (): Promise<{
  followedUpCallRecordingIds: string[];
}> => {
  try {
    const callRecordingIds = await findStuckCallRecordingRequestIds(
      new CoreApiClient(),
    );

    await enqueueCallRecordingRequestFollowUps({ callRecordingIds });

    return { followedUpCallRecordingIds: callRecordingIds };
  } catch (error) {
    throw buildRetryableStepFailure(
      'stuck call recording request follow-up enqueueing',
      error,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier:
    PENDING_CALL_RECORDING_REQUESTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'process-pending-call-recording-requests',
  description:
    'Arms a follow-up for every call recording request still waiting on Recall. Runs after each app upgrade, so requests stuck before then are not left behind.',
  timeoutSeconds: 250,
  handler: processPendingCallRecordingRequestsHandler,
});
