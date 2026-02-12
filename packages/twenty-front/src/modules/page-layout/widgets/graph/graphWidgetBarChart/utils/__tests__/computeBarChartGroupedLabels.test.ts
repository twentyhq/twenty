import { computeBarChartGroupedLabels } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartGroupedLabels';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';

const createMockBar = (overrides: Partial<BarPosition> = {}): BarPosition => ({
  x: 0,
  y: 0,
  width: 50,
  height: 100,
  value: 100,
  indexValue: 'Category1',
  seriesId: 'series1',
  color: 'red',
  shouldRoundFreeEnd: false,
  seriesIndex: 0,
  ...overrides,
});

describe('computeBarChartGroupedLabels', () => {
  describe('basic label computation', () => {
    it('should return labels for each bar', () => {
      const bars = [
        createMockBar({ seriesId: 'bar1', indexValue: 'Cat1', value: 100 }),
        createMockBar({ seriesId: 'bar2', indexValue: 'Cat2', value: 200 }),
      ];

      const result = computeBarChartGroupedLabels(bars);

      expect(result).toHaveLength(2);
    });

    it('should generate unique keys for each label', () => {
      const bars = [
        createMockBar({ seriesId: 'sales', indexValue: 'Jan', value: 100 }),
        createMockBar({ seriesId: 'sales', indexValue: 'Feb', value: 150 }),
      ];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].key).toBe('value-sales-Jan');
      expect(result[1].key).toBe('value-sales-Feb');
    });
  });

  describe('label positioning', () => {
    it('should calculate center X position correctly', () => {
      const bars = [createMockBar({ x: 100, width: 50 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].verticalX).toBe(125);
    });

    it('should calculate center Y position for horizontal labels', () => {
      const bars = [createMockBar({ y: 50, height: 100 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].horizontalY).toBe(100);
    });

    it('should set verticalY to top of bar for positive values', () => {
      const bars = [createMockBar({ y: 50, height: 100, value: 100 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].verticalY).toBe(50);
      expect(result[0].shouldRenderBelow).toBe(false);
    });

    it('should set verticalY to bottom of bar for negative values', () => {
      const bars = [createMockBar({ y: 50, height: 100, value: -100 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].verticalY).toBe(150);
      expect(result[0].shouldRenderBelow).toBe(true);
    });

    it('should set horizontalX to right edge for positive values', () => {
      const bars = [createMockBar({ x: 50, width: 100, value: 100 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].horizontalX).toBe(150);
    });

    it('should set horizontalX to left edge for negative values', () => {
      const bars = [createMockBar({ x: 50, width: 100, value: -100 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].horizontalX).toBe(50);
    });
  });

  describe('value handling', () => {
    it('should extract numeric value from bar', () => {
      const bars = [createMockBar({ value: 42 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].value).toBe(42);
    });

    it('should handle zero values', () => {
      const bars = [createMockBar({ value: 0 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].value).toBe(0);
      expect(result[0].shouldRenderBelow).toBe(false);
    });

    it('should handle decimal values', () => {
      const bars = [createMockBar({ value: 123.456 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result[0].value).toBe(123.456);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = computeBarChartGroupedLabels([]);

      expect(result).toEqual([]);
    });

    it('should handle bars with zero dimensions', () => {
      const bars = [createMockBar({ x: 0, y: 0, width: 0, height: 0 })];

      const result = computeBarChartGroupedLabels(bars);

      expect(result).toHaveLength(1);
      expect(result[0].verticalX).toBe(0);
      expect(result[0].horizontalY).toBe(0);
    });
  });
});
