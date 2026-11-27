import { isNonEmptyArray } from '@sniptt/guards';

import { CALL_RECORDING_SUMMARY_GIST_HEADING } from 'src/constants/call-recording-summary-gist-heading';
import { extractCallRecordingSummarySectionLines } from 'src/logic-functions/domain/extract-call-recording-summary-section-lines.util';

export const extractCallRecordingSummaryGist = (
  summaryMarkdown: string,
): string | undefined => {
  const gistLines = extractCallRecordingSummarySectionLines({
    summaryMarkdown,
    heading: CALL_RECORDING_SUMMARY_GIST_HEADING,
  });

  return isNonEmptyArray(gistLines) ? gistLines.join(' ') : undefined;
};
