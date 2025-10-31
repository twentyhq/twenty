import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { calculateBarChartValueRange } from '../calculateBarChartValueRange';

describe('calculateBarChartValueRange (essential cases)', () => {
  it('returns min=0 and max=highest value for all positive values', () => {
    const data: BarChartDataItem[] = [
      { category: 'A', v1: 10, v2: 20 },
      { category: 'B', v1: 30, v2: 15 },
      { category: 'C', v1: 25, v2: 40 },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateBarChartValueRange(data, keys)).toEqual({
      min: 0,
      max: 40,
    });
  });

  it('returns min=lowest and max=0 for all negative values', () => {
    const data: BarChartDataItem[] = [
      { category: 'A', v1: -10, v2: -20 },
      { category: 'B', v1: -30, v2: -15 },
      { category: 'C', v1: -25, v2: -40 },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateBarChartValueRange(data, keys)).toEqual({
      min: -40,
      max: 0,
    });
  });

  it('includes zero and spans min/max when values cross zero', () => {
    const data: BarChartDataItem[] = [
      { category: 'A', v1: -20, v2: 30 },
      { category: 'B', v1: 15, v2: -10 },
      { category: 'C', v1: -5, v2: 25 },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateBarChartValueRange(data, keys)).toEqual({
      min: -20,
      max: 30,
    });
  });

  it('handles empty data and empty keys', () => {
    expect(calculateBarChartValueRange([], ['v'])).toEqual({ min: 0, max: 0 });
    expect(calculateBarChartValueRange([{ cat: 'A', v: 10 }], [])).toEqual({
      min: 0,
      max: 0,
    });
  });

  it('ignores NaN/missing values', () => {
    const data: BarChartDataItem[] = [
      { category: 'A', v1: 10, v2: NaN },
      { category: 'B', v1: 20, v2: 30 },
      { category: 'C', v1: undefined as unknown as number },
    ];
    const keys = ['v1', 'v2'];

    expect(calculateBarChartValueRange(data, keys)).toEqual({
      min: 0,
      max: 30,
    });
  });
});
