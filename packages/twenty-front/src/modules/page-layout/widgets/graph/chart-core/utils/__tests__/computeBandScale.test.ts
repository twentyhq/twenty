import { computeBandScale } from '@/page-layout/widgets/graph/chart-core/utils/computeBandScale';

describe('computeBandScale', () => {
  it('returns zeros when axis length or count is non-positive', () => {
    expect(computeBandScale({ axisLength: 0, count: 5 })).toEqual({
      step: 0,
      bandwidth: 0,
      offset: 0,
    });
    expect(computeBandScale({ axisLength: 100, count: 0 })).toEqual({
      step: 0,
      bandwidth: 0,
      offset: 0,
    });
  });

  it('computes step, bandwidth, and offset with padding and outer padding', () => {
    const result = computeBandScale({
      axisLength: 100,
      count: 4,
      padding: 0.1,
      outerPaddingPx: 10,
    });

    expect(result.step).toBeCloseTo(80 / 4.1, 6);
    expect(result.bandwidth).toBeCloseTo((80 / 4.1) * 0.9, 6);
    expect(result.offset).toBeCloseTo(10 + (80 / 4.1) * 0.1, 6);
  });

  it('clamps padding and outer padding to valid ranges', () => {
    const result = computeBandScale({
      axisLength: 90,
      count: 2,
      padding: 2,
      outerPaddingPx: -5,
    });

    expect(result.bandwidth).toBe(0);
    expect(result.offset).toBeCloseTo(90 / 3, 6);
  });
});
