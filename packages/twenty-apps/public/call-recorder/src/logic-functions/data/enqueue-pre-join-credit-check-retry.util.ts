import { enqueueJobs } from 'twenty-sdk/logic-function';

import { CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { PRE_JOIN_CREDIT_CHECK_RETRY_DELAY_MS } from 'src/logic-functions/constants/pre-join-credit-check-retry-delay-ms';

export const enqueuePreJoinCreditCheckRetry = async ({
  callRecordingId,
  now,
}: {
  callRecordingId: string;
  now: Date;
}): Promise<void> => {
  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: `credit-check.${callRecordingId}.retry.${now.getTime()}`,
          payload: { callRecordingId },
        },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: PRE_JOIN_CREDIT_CHECK_RETRY_DELAY_MS,
    });
  } catch (error) {
    // Fail open: the bot stays scheduled and records if the retry cannot be queued.
    console.warn(
      `[call-recorder] failed to re-enqueue the pre-join credit check for callRecording ${callRecordingId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
