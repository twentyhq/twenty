import { describe, expect, it } from 'vitest';

import { parseSummaryInlineSegments } from 'src/front-components/utils/parse-summary-inline-segments.util';

describe('parseSummaryInlineSegments', () => {
  it('should return a single plain segment for text without markers', () => {
    expect(parseSummaryInlineSegments('plain text')).toEqual([
      { text: 'plain text', isBold: false },
    ]);
  });

  it('should parse **bold** runs', () => {
    expect(parseSummaryInlineSegments('a **b** c')).toEqual([
      { text: 'a ', isBold: false },
      { text: 'b', isBold: true },
      { text: ' c', isBold: false },
    ]);
  });

  it('should parse __bold__ runs', () => {
    expect(parseSummaryInlineSegments('a __b__ c')).toEqual([
      { text: 'a ', isBold: false },
      { text: 'b', isBold: true },
      { text: ' c', isBold: false },
    ]);
  });

  it('should not match mismatched delimiters', () => {
    expect(parseSummaryInlineSegments('**b__')).toEqual([
      { text: '**b__', isBold: false },
    ]);
  });
});
