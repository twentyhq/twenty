import { type AgentResponseFormat } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { agentResponseFormatSchema } from 'twenty-shared/workflow';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// GraphQL takes the format as JSON, so it is checked here before it reaches the model
export const parseAgentResponseFormatOrThrow = (
  responseFormat: unknown,
): AgentResponseFormat | undefined => {
  if (!isDefined(responseFormat)) {
    return undefined;
  }

  const parsedResponseFormat =
    agentResponseFormatSchema.safeParse(responseFormat);

  if (!parsedResponseFormat.success) {
    throw new AiException(
      `Invalid response format: ${parsedResponseFormat.error.issues
        .map((issue) => issue.message)
        .join(', ')}`,
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  return parsedResponseFormat.data;
};
