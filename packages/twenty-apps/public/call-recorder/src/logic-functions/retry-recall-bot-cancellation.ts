import { isNumber, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RETRY_RECALL_BOT_CANCELLATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/retry-recall-bot-cancellation-logic-function-universal-identifier';
import {
  retryRecallBotCancellation,
  type RetryRecallBotCancellationResult,
} from 'src/logic-functions/flows/retry-recall-bot-cancellation.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export const retryRecallBotCancellationHandler = async (
  payload: unknown,
): Promise<
  RetryRecallBotCancellationResult | { status: 'skipped'; reason: string }
> => {
  const body = asRecord(payload);
  const callRecordingId = getString(body?.callRecordingId);
  const externalBotId = getString(body?.externalBotId);
  const ladderAttempt = body?.ladderAttempt;

  if (isUndefined(callRecordingId) || !isNumber(ladderAttempt)) {
    return {
      status: 'skipped',
      reason: 'invalid Recall bot cancellation retry payload',
    };
  }

  return retryRecallBotCancellation({
    client: new CoreApiClient(),
    callRecordingId,
    externalBotId,
    ladderAttempt,
  });
};

export default defineLogicFunction({
  universalIdentifier:
    RETRY_RECALL_BOT_CANCELLATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'retry-recall-bot-cancellation',
  description:
    'Delayed job that retries a failed Recall bot cancellation with escalating waits until the bot is gone or reclaimed.',
  timeoutSeconds: 60,
  handler: retryRecallBotCancellationHandler,
});
