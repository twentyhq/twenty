import { type BarDatum } from '@nivo/bar';
import { calculateValueRangeFromBarChartKeys } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateValueRangeFromBarChartKeys';

describe('calculateValueRangeFromBarChartKeys (essential cases)', () => {
  it('returns minimum=0 and maximum=highest value for all positive values', () => {
    const data: BarDatum[] = [
      { category: 'A', v1: 10, v2: 20 },
      { category: 'B', v1: 30, v2: 15 },
      { category: 'C', v1: 25, v2: 40 },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateValueRangeFromBarChartKeys(data, keys)).toEqual({
      minimum: 0,
      maximum: 40,
    });
  });

  it('returns minimum=lowest and maximum=0 for all negative values', () => {
    const data: BarDatum[] = [
      { category: 'A', v1: -10, v2: -20 },
      { category: 'B', v1: -30, v2: -15 },
      { category: 'C', v1: -25, v2: -40 },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateValueRangeFromBarChartKeys(data, keys)).toEqual({
      minimum: -40,
      maximum: 0,
    });
  });

  it('includes zero and spans minimum/maximum when values cross zero', () => {
    const data: BarDatum[] = [
      { category: 'A', v1: -20, v2: 30 },
      { category: 'B', v1: 15, v2: -10 },
      { category: 'C', v1: -5, v2: 25 },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateValueRangeFromBarChartKeys(data, keys)).toEqual({
      minimum: -20,
      maximum: 30,
    });
  });

  it('handles empty data and empty keys', () => {
    expect(calculateValueRangeFromBarChartKeys([], ['v'])).toEqual({
      minimum: 0,
      maximum: 0,
    });
    expect(
      calculateValueRangeFromBarChartKeys([{ cat: 'A', v: 10 }], []),
    ).toEqual({
      minimum: 0,
      maximum: 0,
    });
  });

  it('ignores NaN/missing values', () => {
    const data: BarDatum[] = [
      { category: 'A', v1: 10, v2: NaN },
      { category: 'B', v1: 20, v2: 30 },
      { category: 'C', v1: undefined as unknown as number },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateValueRangeFromBarChartKeys(data, keys)).toEqual({
      minimum: 0,
      maximum: 30,
    });
  });
});
