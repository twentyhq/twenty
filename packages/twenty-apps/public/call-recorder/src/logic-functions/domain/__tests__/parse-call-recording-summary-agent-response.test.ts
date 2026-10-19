import { describe, expect, it } from 'vitest';

import { parseCallRecordingSummaryAgentResponse } from 'src/logic-functions/domain/parse-call-recording-summary-agent-response.util';

describe('parseCallRecordingSummaryAgentResponse', () => {
  it('returns the trimmed response markdown on success', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        threadId: 'thread-id',
        status: 'COMPLETED',
        success: true,
        error: null,
        result: { response: '  ## Overview\nGreat call.  ' },
      }),
    ).toEqual({ outcome: 'summarized', markdown: '## Overview\nGreat call.' });
  });

  it('returns undefined when the run failed', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        threadId: 'thread-id',
        status: 'FAILED',
        success: false,
        error: 'no more available credits',
        result: null,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the response is empty or missing', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        threadId: 'thread-id',
        status: 'COMPLETED',
        success: true,
        error: null,
        result: { response: '   ' },
      }),
    ).toBeUndefined();
    expect(
      parseCallRecordingSummaryAgentResponse({
        threadId: 'thread-id',
        status: 'COMPLETED',
        success: true,
        error: null,
        result: {},
      }),
    ).toBeUndefined();
  });

  it('extracts a grounded reason when the transcript cannot be summarized', () => {
    expect(
      parseCallRecordingSummaryAgentResponse({
        threadId: 'thread-id',
        status: 'COMPLETED',
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
        threadId: 'thread-id',
        status: 'COMPLETED',
        success: true,
        error: null,
        result: { response: 'SUMMARY_UNAVAILABLE:' },
      }),
    ).toBeUndefined();
  });
});
