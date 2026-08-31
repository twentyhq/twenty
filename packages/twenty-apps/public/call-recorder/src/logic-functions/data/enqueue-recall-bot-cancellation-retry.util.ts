import { RETRY_RECALL_BOT_CANCELLATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/retry-recall-bot-cancellation-logic-function-universal-identifier';
import { RECALL_BOT_CANCELLATION_RETRY_DELAYS_MS } from 'src/logic-functions/constants/recall-bot-cancellation-retry-delays-ms';
import { RECALL_BOT_CANCELLATION_RETRY_MAX_ATTEMPTS } from 'src/logic-functions/constants/recall-bot-cancellation-retry-max-attempts';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';

export const enqueueRecallBotCancellationRetry = async ({
  callRecordingId,
  externalBotId,
  ladderAttempt,
}: {
  callRecordingId: string;
  externalBotId: string | undefined;
  ladderAttempt: number;
}): Promise<boolean> => {
  if (ladderAttempt >= RECALL_BOT_CANCELLATION_RETRY_MAX_ATTEMPTS) {
    return false;
  }

  const delayMs =
    RECALL_BOT_CANCELLATION_RETRY_DELAYS_MS[
      Math.min(
        ladderAttempt,
        RECALL_BOT_CANCELLATION_RETRY_DELAYS_MS.length - 1,
      )
    ];

  if (delayMs === undefined) {
    return false;
  }

  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      RETRY_RECALL_BOT_CANCELLATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: [
      {
        callRecordingId,
        ...(externalBotId === undefined ? {} : { externalBotId }),
        ladderAttempt,
      },
    ],
    delayMs,
  });

  return true;
};
