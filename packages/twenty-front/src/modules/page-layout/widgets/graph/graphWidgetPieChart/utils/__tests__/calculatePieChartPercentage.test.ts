import { calculatePieChartPercentage } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/calculatePieChartPercentage';

describe('calculatePieChartPercentage', () => {
  describe('valid calculations', () => {
    it('should calculate correct percentage for positive values', () => {
      expect(calculatePieChartPercentage(25, 100)).toBe(25);
    });

    it('should calculate 100% when value equals total', () => {
      expect(calculatePieChartPercentage(100, 100)).toBe(100);
    });

    it('should calculate percentage for decimal values', () => {
      expect(calculatePieChartPercentage(1, 3)).toBeCloseTo(33.33, 1);
    });

    it('should handle small fractions', () => {
      expect(calculatePieChartPercentage(1, 1000)).toBe(0.1);
    });

    it('should handle large values', () => {
      expect(calculatePieChartPercentage(500000, 1000000)).toBe(50);
    });
  });

  describe('edge cases', () => {
    it('should return 0 when totalValue is 0', () => {
      expect(calculatePieChartPercentage(50, 0)).toBe(0);
    });

    it('should return 0 when value is 0', () => {
      expect(calculatePieChartPercentage(0, 100)).toBe(0);
    });

    it('should return 0 when both values are 0', () => {
      expect(calculatePieChartPercentage(0, 0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(calculatePieChartPercentage(-25, 100)).toBe(-25);
    });

    it('should return 0 when totalValue is negative', () => {
      expect(calculatePieChartPercentage(25, -100)).toBe(0);
    });
  });

  describe('NaN handling', () => {
    it('should return NaN when value is NaN', () => {
      expect(calculatePieChartPercentage(NaN, 100)).toBeNaN();
    });

    it('should return NaN when totalValue is NaN', () => {
      expect(calculatePieChartPercentage(50, NaN)).toBeNaN();
    });

    it('should return NaN when both values are NaN', () => {
      expect(calculatePieChartPercentage(NaN, NaN)).toBeNaN();
    });
  });
});
