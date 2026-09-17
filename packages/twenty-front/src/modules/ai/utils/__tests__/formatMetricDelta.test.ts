import { formatMetricDelta } from '@/ai/utils/formatMetricDelta';

describe('formatMetricDelta', () => {
  it.each([
    [1678, '17.8×'],
    [100, '2×'],
    [31, '+31%'],
    [6, '+6%'],
    [99, '+99%'],
    [131, '2.3×'],
    [-94, '-94%'],
    [0, '0%'],
    [-50, '-50%'],
    [-100, '-100%'],
  ])('formats a %s percent change as %s', (delta, expected) => {
    expect(formatMetricDelta(delta)).toBe(expected);
  });
});
