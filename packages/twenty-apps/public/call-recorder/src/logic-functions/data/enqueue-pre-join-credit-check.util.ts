import { enqueueJobs } from 'twenty-sdk/logic-function';

import { CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { PRE_JOIN_CREDIT_CHECK_LEAD_MINUTES } from 'src/logic-functions/constants/pre-join-credit-check-lead-minutes';

export const enqueuePreJoinCreditCheck = async ({
  callRecordingId,
  externalBotId,
  joinAt,
}: {
  callRecordingId: string;
  externalBotId: string;
  joinAt: string;
}): Promise<void> => {
  const joinAtMilliseconds = new Date(joinAt).getTime();
  const checkAtMilliseconds =
    joinAtMilliseconds -
    PRE_JOIN_CREDIT_CHECK_LEAD_MINUTES * MILLISECONDS_PER_MINUTE;

  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        CHECK_CREDITS_BEFORE_RECALL_BOT_JOIN_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          // A re-created or rescheduled bot gets its own check; the queue keeps a completed id for hours.
          jobId: `credit-check.${callRecordingId}.${externalBotId}.${joinAtMilliseconds}`,
          payload: { callRecordingId },
        },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: Math.max(0, checkAtMilliseconds - Date.now()),
    });
  } catch (error) {
    // Fail open: a missed check means a charged recording, not a failed schedule.
    console.warn(
      `[call-recorder] failed to enqueue the pre-join credit check for callRecording ${callRecordingId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
