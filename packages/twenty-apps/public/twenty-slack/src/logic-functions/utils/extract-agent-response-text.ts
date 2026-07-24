import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentResult } from 'twenty-sdk/logic-function';

const hasResponseText = (result: object): result is { response: string } =>
  'response' in result && isNonEmptyString(result.response);

export const extractAgentResponseText = (
  agentResult: RunAgentResult,
): string | undefined => {
  if (!agentResult.success || agentResult.result === null) {
    return undefined;
  }

  if (!hasResponseText(agentResult.result)) {
    return undefined;
  }

  return agentResult.result.response.trim();
};
