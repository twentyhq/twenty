import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentMessage } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

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
  const providedInputCount = [
    isNonEmptyArray(input),
    isNonEmptyString(prompt),
    isNonEmptyArray(messages),
  ].filter(Boolean).length;

  if (providedInputCount !== 1) {
    throw new AiException(
      'Provide exactly one of input, prompt or messages',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  if (isNonEmptyString(prompt)) {
    return [{ role: 'user', content: prompt }];
  }

  return isNonEmptyArray(input) ? input : (messages ?? []);
};
