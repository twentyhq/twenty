import { describe, expect, it } from 'vitest';

import { extractCallRecordingSummaryMarkdown } from 'src/logic-functions/domain/extract-call-recording-summary-markdown.util';

describe('extractCallRecordingSummaryMarkdown', () => {
  it('returns the trimmed response markdown on success', () => {
    expect(
      extractCallRecordingSummaryMarkdown({
        success: true,
        error: null,
        result: { response: '  ## Overview\nGreat call.  ' },
      }),
    ).toBe('## Overview\nGreat call.');
  });

  it('returns undefined when the run failed', () => {
    expect(
      extractCallRecordingSummaryMarkdown({
        success: false,
        error: 'no more available credits',
        result: null,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the response is empty or missing', () => {
    expect(
      extractCallRecordingSummaryMarkdown({
        success: true,
        error: null,
        result: { response: '   ' },
      }),
    ).toBeUndefined();
    expect(
      extractCallRecordingSummaryMarkdown({
        success: true,
        error: null,
        result: {},
      }),
    ).toBeUndefined();
  });

  it('returns the no-summary verdict verbatim', () => {
    expect(
      extractCallRecordingSummaryMarkdown({
        success: true,
        error: null,
        result: { response: 'No summary available.' },
      }),
    ).toBe('No summary available.');
  });
});
