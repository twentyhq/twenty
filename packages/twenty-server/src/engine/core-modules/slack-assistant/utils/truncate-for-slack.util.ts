const SLACK_MAX_MARKDOWN_TEXT_LENGTH = 12000;
const SLACK_TRUNCATION_NOTICE = '\n\n_(response truncated)_';

export const truncateForSlack = (text: string): string => {
  const codePoints = Array.from(text);

  if (codePoints.length <= SLACK_MAX_MARKDOWN_TEXT_LENGTH) {
    return text;
  }

  return (
    codePoints
      .slice(0, SLACK_MAX_MARKDOWN_TEXT_LENGTH - SLACK_TRUNCATION_NOTICE.length)
      .join('') + SLACK_TRUNCATION_NOTICE
  );
};
