import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentResult } from 'twenty-sdk/logic-function';

import { CALL_SUMMARY_UNAVAILABLE_PREFIX } from 'src/constants/call-summary-prompt.constant';

type ParsedCallSummaryAgentResponse =
  | { outcome: 'summarized'; markdown: string }
  | { outcome: 'not-summarizable'; reason: string };

export const parseCallSummaryAgentResponse = (
  agentResult: RunAgentResult,
): ParsedCallSummaryAgentResponse | undefined => {
  if (!agentResult.success) {
    return undefined;
  }

  const response = (agentResult.result as { response?: unknown } | null)
    ?.response;

  if (!isNonEmptyString(response)) {
    return undefined;
  }

  const trimmedResponse = response.trim();

  if (trimmedResponse.startsWith(CALL_SUMMARY_UNAVAILABLE_PREFIX)) {
    const reason = trimmedResponse
      .slice(CALL_SUMMARY_UNAVAILABLE_PREFIX.length)
      .trim();

    return isNonEmptyString(reason)
      ? { outcome: 'not-summarizable', reason }
      : undefined;
  }

  return { outcome: 'summarized', markdown: trimmedResponse };
};
