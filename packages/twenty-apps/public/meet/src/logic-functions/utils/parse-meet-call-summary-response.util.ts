import { isNonEmptyString, isObject } from '@sniptt/guards';

import { MEET_CALL_SUMMARY_UNAVAILABLE_PREFIX } from 'src/constants/meet-call-summary-prompt.constant';
import { MEET_SUMMARY_UNAVAILABLE_HEADING } from 'src/logic-functions/constants/meet-call-summary.constant';

export const parseMeetCallSummaryResponse = (agentResult: {
  success: boolean;
  result: object | null;
}): string | undefined => {
  const { success, result } = agentResult;

  if (
    !success ||
    !isObject(result) ||
    !('response' in result) ||
    !isNonEmptyString(result.response)
  ) {
    return undefined;
  }

  const response = result.response.trim();

  if (!response.startsWith(MEET_CALL_SUMMARY_UNAVAILABLE_PREFIX)) {
    return response;
  }

  const reason = response
    .slice(MEET_CALL_SUMMARY_UNAVAILABLE_PREFIX.length)
    .trim();

  if (!isNonEmptyString(reason)) {
    return undefined;
  }

  return `${MEET_SUMMARY_UNAVAILABLE_HEADING}\n\n${reason}`;
};
