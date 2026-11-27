import { isNonEmptyArray } from '@sniptt/guards';

import { CALL_RECORDING_SUMMARY_ACTION_ITEMS_HEADING } from 'src/constants/call-recording-summary-action-items-heading';
import { extractCallRecordingSummarySectionLines } from 'src/logic-functions/domain/extract-call-recording-summary-section-lines.util';

const NO_ACTION_ITEMS_PATTERN = /^(none|no action items)\b/i;
const LIST_ITEM_PATTERN = /^([-*]|\d+\.)\s/;

export const extractCallRecordingSummaryActionItems = (
  summaryMarkdown: string,
): string | undefined => {
  const actionItemLines = extractCallRecordingSummarySectionLines({
    summaryMarkdown,
    heading: CALL_RECORDING_SUMMARY_ACTION_ITEMS_HEADING,
  });

  if (
    !isNonEmptyArray(actionItemLines) ||
    (actionItemLines.length === 1 &&
      NO_ACTION_ITEMS_PATTERN.test(actionItemLines[0]))
  ) {
    return undefined;
  }

  return actionItemLines
    .map((line, index) =>
      index > 0 && !LIST_ITEM_PATTERN.test(line) ? `\n${line}` : line,
    )
    .join('\n');
};
