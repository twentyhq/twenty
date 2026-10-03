import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentMessage } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const isBlankMessage = (message: RunAgentMessage): boolean =>
  !isNonEmptyString(message.content.trim()) &&
  !isNonEmptyArray(message.attachments);

// GraphQL cannot express XOR
export const resolveRunAgentMessagesOrThrow = ({
  input,
  prompt,
  messages,
}: {
  input?: RunAgentMessage[] | null;
  prompt?: string | null;
  messages?: RunAgentMessage[] | null;
}): RunAgentMessage[] => {
  if ([input, prompt, messages].filter(isDefined).length !== 1) {
    throw new AiException(
      'Provide exactly one of input, prompt or messages',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  if (isDefined(prompt)) {
    if (!isNonEmptyString(prompt)) {
      throw new AiException(
        'prompt must not be empty',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return [{ role: 'user', content: prompt }];
  }

  if (isDefined(messages)) {
    if (!isNonEmptyArray(messages)) {
      throw new AiException(
        'messages must not be empty',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return messages;
  }

  if (!isNonEmptyArray(input) || input.some(isBlankMessage)) {
    throw new AiException(
      'input must hold messages with content or attachments',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  return input;
};
