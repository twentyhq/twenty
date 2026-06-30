import { describe, expect, it } from 'vitest';

import { formatTranscriptTimestamp } from 'src/front-components/utils/format-transcript-timestamp.util';

describe('formatTranscriptTimestamp', () => {
  it('formats sub-hour durations as minutes and padded seconds', () => {
    expect(formatTranscriptTimestamp(0)).toBe('0:00');
    expect(formatTranscriptTimestamp(5)).toBe('0:05');
    expect(formatTranscriptTimestamp(65)).toBe('1:05');
    expect(formatTranscriptTimestamp(3599)).toBe('59:59');
  });

  it('adds an hour part with padded minutes past one hour', () => {
    expect(formatTranscriptTimestamp(3600)).toBe('1:00:00');
    expect(formatTranscriptTimestamp(3725)).toBe('1:02:05');
    expect(formatTranscriptTimestamp(7322)).toBe('2:02:02');
  });

  it('floors fractional seconds', () => {
    expect(formatTranscriptTimestamp(1.9)).toBe('0:01');
    expect(formatTranscriptTimestamp(59.999)).toBe('0:59');
  });

  it('clamps negative and non-finite input to zero', () => {
    expect(formatTranscriptTimestamp(-12)).toBe('0:00');
    expect(formatTranscriptTimestamp(Number.NaN)).toBe('0:00');
    expect(formatTranscriptTimestamp(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});
