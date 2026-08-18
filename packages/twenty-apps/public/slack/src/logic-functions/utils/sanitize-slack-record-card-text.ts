const MARKDOWN_LINK_PATTERN = /\[([^\]\n]*)\]\([^)\s]*\)/g;
const MARKDOWN_EMPHASIS_PATTERN = /(\*\*|__|`)/g;
const WHITESPACE_PATTERN = /\s+/g;

// Card text lands in Slack mrkdwn blocks, which read `*bold*` and `<url|label>`
// differently from the standard Markdown the agent writes everywhere else.
export const sanitizeSlackRecordCardText = (
  value: string,
  maxLength: number,
): string => {
  const flattenedValue = value
    .replace(MARKDOWN_LINK_PATTERN, '$1')
    .replace(MARKDOWN_EMPHASIS_PATTERN, '')
    .replace(WHITESPACE_PATTERN, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (flattenedValue.length <= maxLength) {
    return flattenedValue;
  }

  return `${flattenedValue.slice(0, maxLength - 1).trimEnd()}…`;
};
