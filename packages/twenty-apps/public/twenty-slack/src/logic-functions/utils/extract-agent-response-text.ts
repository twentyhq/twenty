import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentResult } from 'twenty-sdk/logic-function';

export const extractAgentResponseText = (
  agentResult: RunAgentResult,
): string | undefined => {
  if (!agentResult.success) {
    return undefined;
  }

  const result = agentResult.result as { response?: unknown } | null;

  if (result === null || !isNonEmptyString(result.response)) {
    return undefined;
  }

  return result.response.trim();
};
