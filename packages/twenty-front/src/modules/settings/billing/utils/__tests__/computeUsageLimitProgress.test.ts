import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';

describe('computeUsageLimitProgress', () => {
  it('splits the limit between what is consumed and what is left', () => {
    expect(
      computeUsageLimitProgress({ limitValue: 100, consumedValue: 24 }),
    ).toEqual({
      remainingValue: 76,
      consumedPercentage: 24,
      remainingPercentage: 76,
    });
  });

  it('clamps consumption that went over the limit', () => {
    expect(
      computeUsageLimitProgress({ limitValue: 100, consumedValue: 250 }),
    ).toEqual({
      remainingValue: 0,
      consumedPercentage: 100,
      remainingPercentage: 0,
    });
  });

  it('keeps the remaining amount apart from the rounded percentage', () => {
    expect(
      computeUsageLimitProgress({ limitValue: 1000, consumedValue: 996 }),
    ).toEqual({
      remainingValue: 4,
      consumedPercentage: 100,
      remainingPercentage: 0,
    });
  });

  it('reports nothing when consumption was not counted', () => {
    expect(
      computeUsageLimitProgress({ limitValue: 100, consumedValue: null }),
    ).toBeNull();
  });

  it('reports nothing when the limit cannot be divided by', () => {
    expect(
      computeUsageLimitProgress({ limitValue: 0, consumedValue: 10 }),
    ).toBeNull();
  });
});
