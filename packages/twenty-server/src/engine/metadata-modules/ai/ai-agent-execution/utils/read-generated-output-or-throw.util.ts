import { isString } from '@sniptt/guards';
import { type GenerateResult } from 'twenty-shared/application';
import { isPlainObject } from 'twenty-shared/utils';

import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

type GeneratedOutput = Pick<GenerateResult, 'text' | 'object' | 'error'>;

// a completed run always holds an object, with a text response for a text format
export const readGeneratedOutputOrThrow = ({
  outcome,
  isJsonResponse,
}: {
  outcome: AgentRunnerOutcome;
  isJsonResponse: boolean;
}): GeneratedOutput => {
  if (outcome.status === 'FAILED') {
    return { text: null, object: null, error: outcome.error };
  }

  if (outcome.status !== 'COMPLETED' || !isPlainObject(outcome.result)) {
    throw new AiException(
      `A run without a conversation ended ${outcome.status} without a result`,
      AiExceptionCode.AGENT_EXECUTION_FAILED,
    );
  }

  if (isJsonResponse) {
    return { text: null, object: outcome.result, error: null };
  }

  if (!isString(outcome.result.response)) {
    throw new AiException(
      'A completed text run returned no text',
      AiExceptionCode.AGENT_EXECUTION_FAILED,
    );
  }

  return { text: outcome.result.response, object: null, error: null };
};
