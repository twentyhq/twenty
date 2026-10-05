import { getPercentDelta } from '@/ai/utils/getPercentDelta';

describe('getPercentDelta', () => {
  it('rounds the relative difference to a whole percent', () => {
    expect(getPercentDelta({ value: 123, reference: 55 })).toBe(124);
    expect(getPercentDelta({ value: 37.5, reference: 48 })).toBe(-22);
    expect(getPercentDelta({ value: 48, reference: 48 })).toBe(0);
  });

  it('returns undefined when either side is missing or the reference is zero', () => {
    expect(
      getPercentDelta({ value: undefined, reference: 10 }),
    ).toBeUndefined();
    expect(getPercentDelta({ value: 10, reference: null })).toBeUndefined();
    expect(getPercentDelta({ value: 10, reference: 0 })).toBeUndefined();
  });
});
