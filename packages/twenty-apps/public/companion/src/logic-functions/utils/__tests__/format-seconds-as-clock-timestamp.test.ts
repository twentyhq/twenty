import { describe, expect, it } from 'vitest';

import { formatSecondsAsClockTimestamp } from 'src/logic-functions/utils/format-seconds-as-clock-timestamp.util';

describe('formatSecondsAsClockTimestamp', () => {
  it('formats sub-hour durations as minutes and padded seconds', () => {
    expect(formatSecondsAsClockTimestamp(0)).toBe('0:00');
    expect(formatSecondsAsClockTimestamp(5)).toBe('0:05');
    expect(formatSecondsAsClockTimestamp(65)).toBe('1:05');
    expect(formatSecondsAsClockTimestamp(3599)).toBe('59:59');
  });

  it('adds an hour part with padded minutes past one hour', () => {
    expect(formatSecondsAsClockTimestamp(3600)).toBe('1:00:00');
    expect(formatSecondsAsClockTimestamp(3725)).toBe('1:02:05');
    expect(formatSecondsAsClockTimestamp(7322)).toBe('2:02:02');
  });

  it('floors fractional seconds', () => {
    expect(formatSecondsAsClockTimestamp(1.9)).toBe('0:01');
    expect(formatSecondsAsClockTimestamp(59.999)).toBe('0:59');
  });

  it('clamps negative and non-finite input to zero', () => {
    expect(formatSecondsAsClockTimestamp(-12)).toBe('0:00');
    expect(formatSecondsAsClockTimestamp(Number.NaN)).toBe('0:00');
    expect(formatSecondsAsClockTimestamp(Number.POSITIVE_INFINITY)).toBe(
      '0:00',
    );
  });
});
