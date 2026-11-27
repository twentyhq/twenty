import { CALL_RECORDING_SUMMARY_GIST_HEADING } from 'src/constants/call-recording-summary-gist-heading';
import { sanitizeInboxMessageText } from 'src/logic-functions/domain/sanitize-inbox-message-text.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const extractCallRecordingSummaryGist = (
  summaryMarkdown: string,
): string | undefined => {
  const lines = summaryMarkdown.split('\n').map((line) => line.trim());
  const gistHeadingIndex = lines.findIndex(
    (line) =>
      line.toLowerCase() === CALL_RECORDING_SUMMARY_GIST_HEADING.toLowerCase(),
  );

  if (gistHeadingIndex === -1) {
    return undefined;
  }

  const linesAfterHeading = lines.slice(gistHeadingIndex + 1);
  const nextHeadingIndex = linesAfterHeading.findIndex((line) =>
    line.startsWith('#'),
  );
  const gist = (
    nextHeadingIndex === -1
      ? linesAfterHeading
      : linesAfterHeading.slice(0, nextHeadingIndex)
  )
    .filter(isNonEmptyString)
    .join(' ');

  return isNonEmptyString(gist) ? sanitizeInboxMessageText(gist) : undefined;
};
