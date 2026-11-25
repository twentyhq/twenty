import { describe, expect, it } from 'vitest';

import { parseMeetCallSummaryResponse } from 'src/logic-functions/utils/parse-meet-call-summary-response.util';

describe('parseMeetCallSummaryResponse', () => {
  it('should return the markdown the agent wrote', () => {
    expect(
      parseMeetCallSummaryResponse({
        success: true,
        result: { response: '  ## Gist\nPricing call.  ' },
      }),
    ).toBe('## Gist\nPricing call.');
  });

  it('should turn a refusal into a short unavailable summary', () => {
    expect(
      parseMeetCallSummaryResponse({
        success: true,
        result: {
          response: 'SUMMARY_UNAVAILABLE: The call only has greetings.',
        },
      }),
    ).toBe('## Summary unavailable\n\nThe call only has greetings.');
  });

  it('should return nothing for a failed or empty run', () => {
    expect(
      parseMeetCallSummaryResponse({ success: false, result: null }),
    ).toBeUndefined();
    expect(
      parseMeetCallSummaryResponse({
        success: true,
        result: { response: 'SUMMARY_UNAVAILABLE:' },
      }),
    ).toBeUndefined();
  });
});
