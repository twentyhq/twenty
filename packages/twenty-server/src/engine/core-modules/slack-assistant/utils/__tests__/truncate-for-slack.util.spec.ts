import { truncateForSlack } from 'src/engine/core-modules/slack-assistant/utils/truncate-for-slack.util';

const SLACK_MAX_MARKDOWN_TEXT_LENGTH = 12000;
const SLACK_TRUNCATION_NOTICE = '\n\n_(response truncated)_';

describe('truncateForSlack', () => {
  it('returns short text unchanged', () => {
    expect(truncateForSlack('hello world')).toBe('hello world');
  });

  it('returns text at the exact limit unchanged', () => {
    const text = 'a'.repeat(SLACK_MAX_MARKDOWN_TEXT_LENGTH);

    expect(truncateForSlack(text)).toBe(text);
  });

  it('truncates text over the limit and appends the notice', () => {
    const text = 'a'.repeat(SLACK_MAX_MARKDOWN_TEXT_LENGTH + 100);

    const result = truncateForSlack(text);

    expect(result.endsWith(SLACK_TRUNCATION_NOTICE)).toBe(true);
    expect(Array.from(result).length).toBe(SLACK_MAX_MARKDOWN_TEXT_LENGTH);
  });

  it('does not split a multi-code-unit emoji at the truncation boundary', () => {
    // '😀' is a surrogate pair (two UTF-16 code units, one code point).
    const text = '😀'.repeat(SLACK_MAX_MARKDOWN_TEXT_LENGTH + 100);

    const result = truncateForSlack(text);

    expect(result).not.toContain('\uFFFD');
    expect(result.endsWith(SLACK_TRUNCATION_NOTICE)).toBe(true);
  });
});
