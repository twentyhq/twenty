import { isNonEmptyArray, isNonEmptyString, isString } from '@sniptt/guards';
import { listConversationMessages } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type TelegramAssistantRunOutcome } from 'src/logic-functions/types/telegram-assistant-run-outcome.type';

export const readTelegramAssistantRunOutcome = async (
  requestId: string,
): Promise<TelegramAssistantRunOutcome> => {
  const { messages, streamCatchup } = await listConversationMessages({
    agentUniversalIdentifier: TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
    threadKey: requestId,
  });

  if (isDefined(streamCatchup.error)) {
    return { status: 'FAILED', errorMessage: streamCatchup.error.message };
  }

  // the server keeps these chunks only while the reply is still streaming
  if (isNonEmptyArray(streamCatchup.chunks)) {
    return { status: 'RUNNING' };
  }

  const responseText = messages
    .filter((message) => message.role === 'assistant')
    .flatMap((message) => message.parts)
    .map((part) =>
      part.type === 'text' && isString(part.text) ? part.text.trim() : '',
    )
    .filter(isNonEmptyString)
    .pop();

  return isDefined(responseText)
    ? { status: 'COMPLETED', responseText }
    : { status: 'RUNNING' };
};
