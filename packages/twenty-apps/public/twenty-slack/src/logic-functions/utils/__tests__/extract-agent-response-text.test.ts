import { describe, expect, it } from 'vitest';

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

  it('should return undefined when the response is empty', () => {
    const result = extractAgentResponseText({
      success: true,
      error: null,
      result: { response: '' },
    });

    expect(result).toBeUndefined();
  });
});
