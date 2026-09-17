import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  checkCreditsBeforeRecallBotJoin,
  type CheckCreditsBeforeRecallBotJoinResult,
} from 'src/logic-functions/flows/check-credits-before-recall-bot-join.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const handlePreJoinCreditCheckJob = async (
  payload: unknown,
): Promise<CheckCreditsBeforeRecallBotJoinResult> => {
  const body = asRecord(payload);
  const callRecordingId = getString(body?.callRecordingId);
  const joinAt = getString(body?.joinAt);

  if (isUndefined(callRecordingId) || isUndefined(joinAt)) {
    return { status: 'skipped', reason: 'invalid pre-join credit check job' };
  }

  try {
    return await checkCreditsBeforeRecallBotJoin({
      client: new CoreApiClient(),
      callRecordingId,
      joinAt,
      now: new Date(),
    });
  } catch (error) {
    throw buildRetryableStepFailure(
      `pre-join credit check for call recording ${callRecordingId}`,
      error,
    );
  }
};
