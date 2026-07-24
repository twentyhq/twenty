import { describe, expect, it } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH } from 'src/logic-functions/constants/slack-assistant-request-name-max-length';
import { buildSlackAssistantRequestName } from 'src/logic-functions/utils/build-slack-assistant-request-name';

describe('buildSlackAssistantRequestName', () => {
  it('should return short text unchanged', () => {
    expect(buildSlackAssistantRequestName('hello')).toBe('hello');
  });

  it('should truncate on a code-point boundary when emoji would split a surrogate pair', () => {
    // 😀 is one code point / two UTF-16 code units. Filling to the limit with
    // ASCII then appending emoji must not leave a lone high surrogate.
    const asciiPrefix = 'a'.repeat(SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH - 1);
    const name = buildSlackAssistantRequestName(`${asciiPrefix}😀 extra`);

    expect(name.endsWith('…')).toBe(true);
    expect([...name].length).toBe(SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH);
    expect(name.includes('\uD83D')).toBe(false);
  });
});
