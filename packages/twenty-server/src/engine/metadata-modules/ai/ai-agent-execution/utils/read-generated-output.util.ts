import { isString } from '@sniptt/guards';
import { type GenerateResult } from 'twenty-shared/application';
import { isPlainObject } from 'twenty-shared/utils';

import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';

type GeneratedOutput = Pick<GenerateResult, 'text' | 'object' | 'error'>;

export const readGeneratedOutput = ({
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
    return { text: null, object: null, error: 'The run returned no result' };
  }

  if (isJsonResponse) {
    return { text: null, object: outcome.result, error: null };
  }

  return isString(outcome.result.response)
    ? { text: outcome.result.response, object: null, error: null }
    : { text: null, object: null, error: 'The run returned no text' };
};
