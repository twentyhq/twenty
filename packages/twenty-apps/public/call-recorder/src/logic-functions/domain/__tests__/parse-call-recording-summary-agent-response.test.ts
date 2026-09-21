import { describe, expect, it } from 'vitest';

import { parseCallRecordingSummaryAgentResponse } from 'src/logic-functions/domain/parse-call-recording-summary-agent-response.util';

describe('parseCallRecordingSummaryAgentResponse', () => {
  it('returns the trimmed response markdown on success', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        success: true,
        error: null,
        result: { response: '  ## Overview\nGreat call.  ' },
      }),
    ).toEqual({ outcome: 'summarized', markdown: '## Overview\nGreat call.' });
  });

  it('returns undefined when the run failed', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        success: false,
        error: 'no more available credits',
        result: null,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the response is empty or missing', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        success: true,
        error: null,
        result: { response: '   ' },
      }),
    ).toBeUndefined();
    expect(
      parseCallRecordingSummaryAgentResponse({
        success: true,
        error: null,
        result: {},
      }),
    ).toBeUndefined();
  });

  it('extracts a grounded reason when the transcript cannot be summarized', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        success: true,
        error: null,
        result: {
          response:
            'SUMMARY_UNAVAILABLE: The transcript contains only greetings and audio checks.',
        },
      }),
    ).toEqual({
      outcome: 'not-summarizable',
      reason: 'The transcript contains only greetings and audio checks.',
    });
  });

  it('rejects an unavailable marker without a reason', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        success: true,
        error: null,
        result: { response: 'SUMMARY_UNAVAILABLE:' },
      }),
    ).toBeUndefined();
  });
});
