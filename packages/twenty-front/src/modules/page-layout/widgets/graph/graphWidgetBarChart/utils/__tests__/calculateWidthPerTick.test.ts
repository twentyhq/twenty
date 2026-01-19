import { calculateWidthPerTick } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateWidthPerTick';
import { BarChartLayout } from '~/generated/graphql';

describe('calculateWidthPerTick', () => {
  describe('vertical layout', () => {
    it('should calculate width per tick based on categoryTickCount for vertical layout', () => {
      const result = calculateWidthPerTick({
        layout: BarChartLayout.VERTICAL,
        availableWidth: 500,
        categoryTickCount: 10,
        valueTickCount: 5,
      });

      expect(result).toBe(50);
    });

    it('should return 0 when categoryTickCount is 0 for vertical layout', () => {
      const result = calculateWidthPerTick({
        layout: BarChartLayout.VERTICAL,
        availableWidth: 500,
        categoryTickCount: 0,
        valueTickCount: 5,
      });

      expect(result).toBe(0);
    });

    it('should handle small available width', () => {
      const result = calculateWidthPerTick({
        layout: BarChartLayout.VERTICAL,
        availableWidth: 100,
        categoryTickCount: 20,
        valueTickCount: 5,
      });

      expect(result).toBe(5);
    });
  });

  describe('horizontal layout', () => {
    it('should calculate width per tick based on valueTickCount for horizontal layout', () => {
      const result = calculateWidthPerTick({
        layout: BarChartLayout.HORIZONTAL,
        availableWidth: 600,
        categoryTickCount: 10,
        valueTickCount: 6,
      });

      expect(result).toBe(100);
    });

    it('should return 0 when valueTickCount is 0 for horizontal layout', () => {
      const result = calculateWidthPerTick({
        layout: BarChartLayout.HORIZONTAL,
        availableWidth: 500,
        categoryTickCount: 10,
        valueTickCount: 0,
      });

      expect(result).toBe(0);
    });

    it('should handle decimal results', () => {
      const result = calculateWidthPerTick({
        layout: BarChartLayout.HORIZONTAL,
        availableWidth: 100,
        categoryTickCount: 10,
        valueTickCount: 3,
      });

      expect(result).toBeCloseTo(33.33, 1);
    });
  });

  describe('edge cases', () => {
    it('should handle availableWidth of 0', () => {
      const result = calculateWidthPerTick({
        layout: BarChartLayout.VERTICAL,
        availableWidth: 0,
        categoryTickCount: 10,
        valueTickCount: 5,
      });

      expect(result).toBe(0);
    });

    it('should handle single tick', () => {
      const result = calculateWidthPerTick({
        layout: BarChartLayout.VERTICAL,
        availableWidth: 500,
        categoryTickCount: 1,
        valueTickCount: 5,
      });

      expect(result).toBe(500);
    });
  });
});
