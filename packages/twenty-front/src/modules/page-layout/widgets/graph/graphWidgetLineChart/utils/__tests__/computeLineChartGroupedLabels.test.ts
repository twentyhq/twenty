import { computeLineChartGroupedLabels } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartGroupedLabels';
import { type LineSeries, type Point } from '@nivo/line';

type MockPointOverrides = Omit<Partial<Point<LineSeries>>, 'data'> & {
  data?: { x?: string | number; y?: string | number };
};

describe('computeLineChartGroupedLabels', () => {
  const createMockPoint = (
    overrides: MockPointOverrides,
  ): Point<LineSeries> => {
    const { data: dataOverrides, ...restOverrides } = overrides;
    return {
      id: 'point1',
      seriesId: 'series1',
      x: 100,
      y: 50,
      data: {
        x: 'Jan',
        y: 100,
        xFormatted: 'Jan',
        yFormatted: '100',
        ...dataOverrides,
      },
      ...restOverrides,
    } as unknown as Point<LineSeries>;
  };

  describe('basic label computation', () => {
    it('should return labels for each point', () => {
      const points = [
        createMockPoint({ seriesId: 'series1', data: { x: 'Jan', y: 100 } }),
        createMockPoint({ seriesId: 'series1', data: { x: 'Feb', y: 150 } }),
      ];

      const result = computeLineChartGroupedLabels(points);

      expect(result).toHaveLength(2);
    });

    it('should generate unique keys for each label', () => {
      const points = [
        createMockPoint({ seriesId: 'revenue', data: { x: 'Q1', y: 100 } }),
        createMockPoint({ seriesId: 'revenue', data: { x: 'Q2', y: 150 } }),
      ];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].key).toBe('value-revenue-Q1');
      expect(result[1].key).toBe('value-revenue-Q2');
    });
  });

  describe('label positioning', () => {
    it('should use point x coordinate for label x', () => {
      const points = [createMockPoint({ x: 250 })];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].x).toBe(250);
    });

    it('should use point y coordinate for label y', () => {
      const points = [createMockPoint({ y: 75 })];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].y).toBe(75);
    });
  });

  describe('shouldRenderBelow logic', () => {
    it('should set shouldRenderBelow to false for positive values', () => {
      const points = [createMockPoint({ data: { x: 'Jan', y: 100 } })];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].shouldRenderBelow).toBe(false);
    });

    it('should set shouldRenderBelow to true for negative values', () => {
      const points = [createMockPoint({ data: { x: 'Jan', y: -50 } })];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].shouldRenderBelow).toBe(true);
    });

    it('should set shouldRenderBelow to false for zero', () => {
      const points = [createMockPoint({ data: { x: 'Jan', y: 0 } })];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].shouldRenderBelow).toBe(false);
    });
  });

  describe('value extraction', () => {
    it('should extract numeric value from point data', () => {
      const points = [createMockPoint({ data: { x: 'Jan', y: 42.5 } })];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].value).toBe(42.5);
    });

    it('should handle string y values by converting to number', () => {
      const points = [
        createMockPoint({ data: { x: 'Jan', y: '123' as unknown as number } }),
      ];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].value).toBe(123);
    });

    it('should handle large numbers', () => {
      const points = [createMockPoint({ data: { x: 'Jan', y: 1000000 } })];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].value).toBe(1000000);
    });
  });

  describe('multiple series', () => {
    it('should handle points from different series', () => {
      const points = [
        createMockPoint({ seriesId: 'sales', data: { x: 'Jan', y: 100 } }),
        createMockPoint({ seriesId: 'revenue', data: { x: 'Jan', y: 200 } }),
      ];

      const result = computeLineChartGroupedLabels(points);

      expect(result[0].key).toBe('value-sales-Jan');
      expect(result[1].key).toBe('value-revenue-Jan');
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = computeLineChartGroupedLabels([]);

      expect(result).toEqual([]);
    });

    it('should handle single point', () => {
      const points = [
        createMockPoint({ seriesId: 'series1', data: { x: 'Only', y: 50 } }),
      ];

      const result = computeLineChartGroupedLabels(points);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(50);
    });
  });
});
