import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';

import { enqueuePreJoinCreditCheckRetry } from 'src/logic-functions/data/enqueue-pre-join-credit-check-retry.util';
import {
  checkCreditsBeforeRecallBotJoin,
  type CheckCreditsBeforeRecallBotJoinResult,
} from 'src/logic-functions/flows/check-credits-before-recall-bot-join.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';
import { fetchWithTimeout } from 'src/logic-functions/utils/fetch-with-timeout.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

type HandlePreJoinCreditCheckJobResult =
  | CheckCreditsBeforeRecallBotJoinResult
  | { status: 'deferred'; reason: string };

export const handlePreJoinCreditCheckJob = async (
  payload: unknown,
  context: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<HandlePreJoinCreditCheckJobResult> => {
  const body = asRecord(payload);
  const callRecordingId = getString(body?.callRecordingId);

  if (isUndefined(callRecordingId)) {
    return { status: 'skipped', reason: 'invalid pre-join credit check job' };
  }

  try {
    return await checkCreditsBeforeRecallBotJoin({
      // The job may fire days after the run that enqueued it, so it must not borrow that run's user.
      client: new CoreApiClient({
        runAs: 'application',
        fetch: fetchWithTimeout,
      }),
      callRecordingId,
      now: new Date(),
    });
  } catch (error) {
    if (context.retryCount < context.maxRetries) {
      throw buildRetryableStepFailure(
        `pre-join credit check for call recording ${callRecordingId}`,
        error,
      );
    }

    // The flow skips itself once the join time has passed, which bounds these retries to the lead.
    console.error(
      `[call-recorder] pre-join credit check for callRecording ${callRecordingId} failed on its last queue attempt, retrying in one minute: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    await enqueuePreJoinCreditCheckRetry({ callRecordingId });

    return {
      status: 'deferred',
      reason: 'credit check re-enqueued after exhausting queue retries',
    };
  }
};
