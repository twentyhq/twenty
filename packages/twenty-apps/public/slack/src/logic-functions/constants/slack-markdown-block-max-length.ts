// Slack caps the text of all markdown blocks in one payload at 12000 characters
// combined, and applies the same cap to markdown_text, so a longer answer cannot
// be rendered in a single message however it is split
export const SLACK_MARKDOWN_BLOCK_MAX_LENGTH = 12000;
