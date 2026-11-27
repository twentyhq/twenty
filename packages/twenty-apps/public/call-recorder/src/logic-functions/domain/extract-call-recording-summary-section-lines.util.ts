import { sanitizeInboxMessageText } from 'src/logic-functions/domain/sanitize-inbox-message-text.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const HEADING_PATTERN = /^#{1,6}\s/;

export const extractCallRecordingSummarySectionLines = ({
  summaryMarkdown,
  heading,
}: {
  summaryMarkdown: string;
  heading: string;
}): string[] => {
  const lines = summaryMarkdown.split('\n').map((line) => line.trim());
  const headingIndex = lines.findIndex(
    (line) => line.toLowerCase() === heading.toLowerCase(),
  );

  if (headingIndex === -1) {
    return [];
  }

  const linesAfterHeading = lines.slice(headingIndex + 1);
  const nextHeadingIndex = linesAfterHeading.findIndex((line) =>
    HEADING_PATTERN.test(line),
  );

  return (
    nextHeadingIndex === -1
      ? linesAfterHeading
      : linesAfterHeading.slice(0, nextHeadingIndex)
  )
    .filter(isNonEmptyString)
    .map(sanitizeInboxMessageText);
};
