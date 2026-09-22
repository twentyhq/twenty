import { msg } from '@lingui/core/macro';
import { type AgentResponseFormat } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const assertAgentResponseFormatHasOutputFieldsOrThrow = (
  responseFormat: AgentResponseFormat | undefined,
): void => {
  if (
    responseFormat?.type === 'json' &&
    !isDefined(responseFormat.schema?.properties)
  ) {
    throw new AiException(
      'This agent has no output fields. Add at least one output field to its response format.',
      AiExceptionCode.INVALID_AGENT_INPUT,
      {
        userFriendlyMessage: msg`This agent has no output fields. Add at least one output field to its response format.`,
      },
    );
  }
};
