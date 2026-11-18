import { describe, expect, it } from 'vitest';

import { parseGoogleMeetCallSummaryResponse } from 'src/logic-functions/utils/parse-google-meet-call-summary-response.util';

describe('parseGoogleMeetCallSummaryResponse', () => {
  it('should return the markdown the agent wrote', () => {
    expect(
      parseGoogleMeetCallSummaryResponse({
        success: true,
        result: { response: '  ## Gist\nPricing call.  ' },
      }),
    ).toBe('## Gist\nPricing call.');
  });

  it('should turn a refusal into a short unavailable summary', () => {
    expect(
      parseGoogleMeetCallSummaryResponse({
        success: true,
        result: {
          response: 'SUMMARY_UNAVAILABLE: The call only has greetings.',
        },
      }),
    ).toBe('## Summary unavailable\n\nThe call only has greetings.');
  });

  it('should return nothing for a failed or empty run', () => {
    expect(
      parseGoogleMeetCallSummaryResponse({ success: false, result: null }),
    ).toBeUndefined();
    expect(
      parseGoogleMeetCallSummaryResponse({
        success: true,
        result: { response: 'SUMMARY_UNAVAILABLE:' },
      }),
    ).toBeUndefined();
  });
});
