import { isNumber, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { enqueueCallRecordingRequestFollowUps } from 'src/logic-functions/data/enqueue-call-recording-request-follow-ups.util';
import {
  followUpCallRecordingRequest,
  type FollowUpCallRecordingRequestResult,
} from 'src/logic-functions/flows/follow-up-call-recording-request.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { fetchWithTimeout } from 'src/logic-functions/utils/fetch-with-timeout.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const followUpCallRecordingRequestHandler = async (
  payload: unknown,
): Promise<
  FollowUpCallRecordingRequestResult | { status: 'skipped'; reason: string }
> => {
  const body = asRecord(payload);
  const callRecordingId = getString(body?.callRecordingId);

  if (isUndefined(callRecordingId)) {
    return { status: 'skipped', reason: 'invalid follow-up job' };
  }

  const attemptValue = body?.attempt;
  const attempt = isNumber(attemptValue) ? attemptValue : 0;
  const now = new Date();

  try {
    const result = await followUpCallRecordingRequest({
      // The follow-up runs long after the run that armed it, so it must not
      // borrow that run's user.
      client: new CoreApiClient({
        runAs: 'application',
        fetch: fetchWithTimeout,
      }),
      callRecordingId,
      attempt,
      now,
    });

    if (result.status === 'follow-up-again') {
      await enqueueCallRecordingRequestFollowUps({
        callRecordingIds: [callRecordingId],
        delayMs: Math.max(0, result.dueAt.getTime() - now.getTime()),
        attempt: attempt + 1,
      });
    }

    return result;
  } catch (error) {
    throw buildRetryableStepFailure(
      `follow-up of call recording ${callRecordingId}`,
      error,
    );
  }
};

export default defineLogicFunction({
  universalIdentifier:
    FOLLOW_UP_CALL_RECORDING_REQUEST_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'follow-up-call-recording-request',
  description:
    'Checks a call recording request a while after it changed and finishes what Recall left undone: books a missing bot, cancels a leftover one, or marks the recording failed once its meeting is over.',
  timeoutSeconds: 120,
  handler: followUpCallRecordingRequestHandler,
});
