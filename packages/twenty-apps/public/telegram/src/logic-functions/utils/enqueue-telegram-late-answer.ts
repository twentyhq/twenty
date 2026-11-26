import { enqueueJobs } from 'twenty-sdk/logic-function';

import { TELEGRAM_LATE_ANSWER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_LATE_ANSWER_CHECK_DELAY_MS } from 'src/logic-functions/constants/telegram-late-answer-check-delay-ms';
import { type TelegramLateAnswerPayload } from 'src/logic-functions/types/telegram-late-answer-payload.type';

export const enqueueTelegramLateAnswer = async (
  payload: TelegramLateAnswerPayload,
): Promise<void> => {
  await enqueueJobs({
    logicFunctionUniversalIdentifier: TELEGRAM_LATE_ANSWER_UNIVERSAL_IDENTIFIER,
    jobs: [{ payload }],
    delayMs: TELEGRAM_LATE_ANSWER_CHECK_DELAY_MS,
  });
};
