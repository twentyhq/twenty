import { describe, expect, it } from 'vitest';

import { parseSummaryInlineSegments } from 'src/front-components/utils/parse-summary-inline-segments.util';

describe('parseSummaryInlineSegments', () => {
  it('returns a single plain segment when there is no bold', () => {
    expect(parseSummaryInlineSegments('Just text')).toEqual([
      { text: 'Just text', isBold: false },
    ]);
  });

  it('splits a bold run from surrounding text', () => {
    expect(parseSummaryInlineSegments('before **bold** after')).toEqual([
      { text: 'before ', isBold: false },
      { text: 'bold', isBold: true },
      { text: ' after', isBold: false },
    ]);
  });

  it('preserves whitespace between adjacent bold runs', () => {
    expect(parseSummaryInlineSegments('**Alex** **Sam**')).toEqual([
      { text: 'Alex', isBold: true },
      { text: ' ', isBold: false },
      { text: 'Sam', isBold: true },
    ]);
  });

  it('treats unclosed or empty markers as plain text', () => {
    expect(parseSummaryInlineSegments('**unclosed')).toEqual([
      { text: '**unclosed', isBold: false },
    ]);
    expect(parseSummaryInlineSegments('****')).toEqual([
      { text: '****', isBold: false },
    ]);
  });

  it('returns an empty array for an empty string', () => {
    expect(parseSummaryInlineSegments('')).toEqual([]);
  });
});
