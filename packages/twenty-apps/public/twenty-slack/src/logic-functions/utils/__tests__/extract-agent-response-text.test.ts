import { describe, expect, it } from 'vitest';

import { SLACK_ASSISTANT_EMPTY_RESPONSE_FALLBACK_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-response-fallback-text';
import { extractAgentResponseText } from 'src/logic-functions/utils/extract-agent-response-text';

describe('extractAgentResponseText', () => {
  it('should return the trimmed response text on success', () => {
    const result = extractAgentResponseText({
      success: true,
      error: null,
      result: { response: '  Created the invoice for ACME.  ' },
    });

    expect(result).toBe('Created the invoice for ACME.');
  });

  it('should return undefined when the agent failed', () => {
    const result = extractAgentResponseText({
      success: false,
      error: 'no more credits',
      result: null,
    });

    expect(result).toBeUndefined();
  });

  it('should fall back when the response is empty but the run succeeded', () => {
    const result = extractAgentResponseText({
      success: true,
      error: null,
      result: { response: '' },
    });

    expect(result).toBe(SLACK_ASSISTANT_EMPTY_RESPONSE_FALLBACK_TEXT);
  });

  it('should fall back when the result object has no response field', () => {
    const result = extractAgentResponseText({
      success: true,
      error: null,
      result: { somethingElse: true },
    });

    expect(result).toBe(SLACK_ASSISTANT_EMPTY_RESPONSE_FALLBACK_TEXT);
  });
});
