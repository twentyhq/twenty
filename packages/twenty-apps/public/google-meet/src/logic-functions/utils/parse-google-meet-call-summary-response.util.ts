import { isNonEmptyString, isObject } from '@sniptt/guards';

import { GOOGLE_MEET_CALL_SUMMARY_UNAVAILABLE_PREFIX } from 'src/constants/google-meet-call-summary-prompt.constant';
import { GOOGLE_MEET_SUMMARY_UNAVAILABLE_HEADING } from 'src/logic-functions/constants/google-meet-call-summary.constant';

export const parseGoogleMeetCallSummaryResponse = (agentResult: {
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

  if (!response.startsWith(GOOGLE_MEET_CALL_SUMMARY_UNAVAILABLE_PREFIX)) {
    return response;
  }

  const reason = response
    .slice(GOOGLE_MEET_CALL_SUMMARY_UNAVAILABLE_PREFIX.length)
    .trim();

  if (!isNonEmptyString(reason)) {
    return undefined;
  }

  return `${GOOGLE_MEET_SUMMARY_UNAVAILABLE_HEADING}\n\n${reason}`;
};
