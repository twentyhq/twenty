import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { calculateStackedBarChartValueRange } from '../calculateStackedBarChartValueRange';

describe('calculateStackedBarChartValueRange', () => {
  describe('all positive values', () => {
    it('returns min=0 and max=largest positive stack', () => {
      const data: BarChartDataItem[] = [
        { cat: 'A', v1: 100, v2: 200, v3: 50 },
        { cat: 'B', v1: 150, v2: 25, v3: 75 },
        { cat: 'C', v1: 300, v2: 10, v3: 0 },
      ];
      const keys = ['v1', 'v2', 'v3'];

      const result = calculateStackedBarChartValueRange(data, keys);

      expect(result).toEqual({ min: 0, max: 350 });
    });
  });

  describe('all negative values', () => {
    it('returns min=most negative stack and max=0', () => {
      const data: BarChartDataItem[] = [
        { cat: 'A', v1: -100, v2: -200, v3: 0 },
        { cat: 'B', v1: -50, v2: -25, v3: -75 },
      ];
      const keys = ['v1', 'v2', 'v3'];

      const result = calculateStackedBarChartValueRange(data, keys);

      expect(result).toEqual({ min: -300, max: 0 });
    });
  });

  describe('mixed positive and negative values', () => {
    it('sums positives and negatives per index to compute range', () => {
      const data: BarChartDataItem[] = [
        { cat: 'A', v1: 100, v2: -60, v3: 20 },
        { cat: 'B', v1: 50, v2: -80, v3: -30 },
        { cat: 'C', v1: 10, v2: 0, v3: 0 },
      ];
      const keys = ['v1', 'v2', 'v3'];

      const result = calculateStackedBarChartValueRange(data, keys);

      expect(result).toEqual({ min: -110, max: 120 });
    });
  });

  describe('edge cases', () => {
    it('handles empty data', () => {
      const result = calculateStackedBarChartValueRange([], ['v1']);
      expect(result).toEqual({ min: 0, max: 0 });
    });

    it('handles empty keys', () => {
      const data: BarChartDataItem[] = [{ cat: 'A', v1: 10 }];
      const result = calculateStackedBarChartValueRange(data, []);
      expect(result).toEqual({ min: 0, max: 0 });
    });

    it('ignores missing keys and NaN values', () => {
      const data: BarChartDataItem[] = [
        { cat: 'A', v1: 10 },
        { cat: 'B', v2: 30 },
        { cat: 'C', v1: NaN as number },
      ];
      const keys = ['v1', 'v2'];

      const result = calculateStackedBarChartValueRange(data, keys);

      expect(result).toEqual({ min: 0, max: 30 });
    });

    it('handles decimals and large numbers', () => {
      const data: BarChartDataItem[] = [
        { cat: 'A', v1: 10.5, v2: 5.25, v3: -1.1 },
        { cat: 'B', v1: 1_000_000, v2: -500_000 },
      ];
      const keys = ['v1', 'v2', 'v3'];

      const result = calculateStackedBarChartValueRange(data, keys);

      expect(result).toEqual({ min: -500000, max: 1000000 });
    });
  });
});
