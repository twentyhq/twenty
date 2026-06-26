import { type RunAgentResult } from 'twenty-sdk/logic-function';

import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

// Sentinel the agent returns when the transcript can't be summarized; treated
// as "no summary" so nothing is stored.
const NO_SUMMARY_SENTINEL = 'no summary available.';

// A text-format agent returns { response: string }. Pulls the Markdown out and
// returns undefined when the run failed or produced no usable summary.
export const extractCallRecordingSummaryMarkdown = (
  agentResult: RunAgentResult,
): string | undefined => {
  if (!agentResult.success) {
    return undefined;
  }

  const response = asRecord(agentResult.result)?.response;

  if (!isNonEmptyString(response)) {
    return undefined;
  }

  const markdown = response.trim();

  if (markdown.toLowerCase() === NO_SUMMARY_SENTINEL) {
    return undefined;
  }

  return markdown;
};
