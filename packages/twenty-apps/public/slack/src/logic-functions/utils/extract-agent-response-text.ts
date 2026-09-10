import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentResult } from 'twenty-sdk/logic-function';

const SLACK_ASSISTANT_EMPTY_RESPONSE_FALLBACK_TEXT =
  'Done. I finished the requested action, but did not get a text summary back from the model.';

const hasResponseText = (result: object): result is { response: string } =>
  'response' in result && typeof result.response === 'string';

export const extractAgentResponseText = (
  agentResult: RunAgentResult,
): string | undefined => {
  if (!agentResult.success || agentResult.result === null) {
    return undefined;
  }

  if (!hasResponseText(agentResult.result)) {
    return SLACK_ASSISTANT_EMPTY_RESPONSE_FALLBACK_TEXT;
  }

  const trimmedResponse = agentResult.result.response.trim();

  if (!isNonEmptyString(trimmedResponse)) {
    return SLACK_ASSISTANT_EMPTY_RESPONSE_FALLBACK_TEXT;
  }

  return trimmedResponse;
};
