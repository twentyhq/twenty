import { type RunAgentResult } from 'twenty-sdk/logic-function';
import { CALL_RECORDING_SUMMARY_UNAVAILABLE_PREFIX } from 'src/constants/CALL_RECORDING_SUMMARY_UNAVAILABLE_PREFIX';
import { asRecord } from 'src/logic-functions/utils/asRecord';
import { isNonEmptyString } from 'src/logic-functions/utils/isNonEmptyString';

type ParsedCallRecordingSummaryAgentResponse =
  | { outcome: 'summarized'; markdown: string }
  | { outcome: 'not-summarizable'; reason: string };

export const parseCallRecordingSummaryAgentResponse = (
  agentResult: RunAgentResult,
): ParsedCallRecordingSummaryAgentResponse | undefined => {
  if (!agentResult.success) {
    return undefined;
  }

  const response = asRecord(agentResult.result)?.response;

  if (!isNonEmptyString(response)) {
    return undefined;
  }

  const trimmedResponse = response.trim();

  if (trimmedResponse.startsWith(CALL_RECORDING_SUMMARY_UNAVAILABLE_PREFIX)) {
    const reason = trimmedResponse
      .slice(CALL_RECORDING_SUMMARY_UNAVAILABLE_PREFIX.length)
      .trim();

    return isNonEmptyString(reason)
      ? { outcome: 'not-summarizable', reason }
      : undefined;
  }

  return { outcome: 'summarized', markdown: trimmedResponse };
};
