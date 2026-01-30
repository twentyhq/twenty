import { type BarDatum } from '@nivo/bar';
import { calculateStackedBarChartValueRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateStackedBarChartValueRange';

describe('calculateStackedBarChartValueRange (essential cases)', () => {
  it('returns minimum=0 and maximum=largest positive stack', () => {
    const data: BarDatum[] = [
      { cat: 'A', v1: 100, v2: 200, v3: 50 },
      { cat: 'B', v1: 150, v2: 25, v3: 75 },
      { cat: 'C', v1: 300, v2: 10, v3: 0 },
    ];
    const keys = ['v1', 'v2', 'v3'];

    expect(calculateStackedBarChartValueRange(data, keys)).toEqual({
      minimum: 0,
      maximum: 350,
    });
  });

  it('returns minimum=most negative stack and maximum=0 for all negative values', () => {
    const data: BarDatum[] = [
      { cat: 'A', v1: -100, v2: -200, v3: 0 },
      { cat: 'B', v1: -50, v2: -25, v3: -75 },
    ];
    const keys = ['v1', 'v2', 'v3'];

    expect(calculateStackedBarChartValueRange(data, keys)).toEqual({
      minimum: -300,
      maximum: 0,
    });
  });

  it('sums positives and negatives per index to compute range when values mix', () => {
    const data: BarDatum[] = [
      { cat: 'A', v1: 100, v2: -60, v3: 20 },
      { cat: 'B', v1: 50, v2: -80, v3: -30 },
      { cat: 'C', v1: 10, v2: 0, v3: 0 },
    ];
    const keys = ['v1', 'v2', 'v3'];

    expect(calculateStackedBarChartValueRange(data, keys)).toEqual({
      minimum: -110,
      maximum: 120,
    });
  });

  it('handles empty data and empty keys', () => {
    expect(calculateStackedBarChartValueRange([], ['v1'])).toEqual({
      minimum: 0,
      maximum: 0,
    });
    expect(
      calculateStackedBarChartValueRange([{ cat: 'A', v1: 10 }], []),
    ).toEqual({ minimum: 0, maximum: 0 });
  });

  it('ignores missing keys and NaN values', () => {
    const data: BarDatum[] = [
      { cat: 'A', v1: 10 },
      { cat: 'B', v2: 30 },
      { cat: 'C', v1: NaN as number },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateStackedBarChartValueRange(data, keys)).toEqual({
      minimum: 0,
      maximum: 30,
    });
  });
});
