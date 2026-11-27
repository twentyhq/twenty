import { CALL_RECORDING_SUMMARY_UNAVAILABLE_HEADING } from 'src/constants/call-recording-summary-unavailable-heading';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const isCallRecordingSummaryAvailable = (
  summaryMarkdown: string | null | undefined,
): boolean =>
  isNonEmptyString(summaryMarkdown) &&
  !summaryMarkdown.startsWith(CALL_RECORDING_SUMMARY_UNAVAILABLE_HEADING);
