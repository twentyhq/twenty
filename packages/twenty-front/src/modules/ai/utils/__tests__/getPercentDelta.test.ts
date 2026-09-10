import { getPercentDelta } from '@/ai/utils/getPercentDelta';

describe('getPercentDelta', () => {
  it('rounds the relative difference to a whole percent', () => {
    expect(getPercentDelta(123, 55)).toBe(124);
    expect(getPercentDelta(37.5, 48)).toBe(-22);
    expect(getPercentDelta(48, 48)).toBe(0);
  });

  it('returns undefined when either side is missing or the reference is zero', () => {
    expect(getPercentDelta(undefined, 10)).toBeUndefined();
    expect(getPercentDelta(10, null)).toBeUndefined();
    expect(getPercentDelta(10, 0)).toBeUndefined();
  });
});
