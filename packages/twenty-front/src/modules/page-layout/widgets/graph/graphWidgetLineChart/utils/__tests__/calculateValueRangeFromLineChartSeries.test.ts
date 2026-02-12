import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeriesWithColor';
import { calculateValueRangeFromLineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/calculateValueRangeFromLineChartSeries';
import { type LineChartSeries } from '~/generated-metadata/graphql';

describe('calculateValueRangeFromLineChartSeries', () => {
  describe('with valid data', () => {
    it('should calculate minimum and maximum from single series', () => {
      const data: LineChartSeriesWithColor[] = [
        {
          id: 'series1',
          data: [
            { x: 'Jan', y: 10 },
            { x: 'Feb', y: 50 },
            { x: 'Mar', y: 30 },
          ],
        },
      ] as unknown as LineChartSeriesWithColor[];

      const result = calculateValueRangeFromLineChartSeries(data);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(50);
    });

    it('should calculate minimum and maximum from multiple series', () => {
      const data: LineChartSeriesWithColor[] = [
        {
          id: 'series1',
          data: [
            { x: 'Jan', y: 10 },
            { x: 'Feb', y: 20 },
          ],
        },
        {
          id: 'series2',
          data: [
            { x: 'Jan', y: 5 },
            { x: 'Feb', y: 100 },
          ],
        },
      ] as unknown as LineChartSeries[];

      const result = calculateValueRangeFromLineChartSeries(data);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(100);
    });

    it('should handle negative values', () => {
      const data: LineChartSeriesWithColor[] = [
        {
          id: 'series1',
          data: [
            { x: 'Jan', y: -50 },
            { x: 'Feb', y: 25 },
            { x: 'Mar', y: -10 },
          ],
        },
      ] as unknown as LineChartSeriesWithColor[];

      const result = calculateValueRangeFromLineChartSeries(data);

      expect(result.minimum).toBe(-50);
      expect(result.maximum).toBe(25);
    });

    it('should handle all same values', () => {
      const data: LineChartSeriesWithColor[] = [
        {
          id: 'series1',
          data: [
            { x: 'Jan', y: 42 },
            { x: 'Feb', y: 42 },
            { x: 'Mar', y: 42 },
          ],
        },
      ] as unknown as LineChartSeriesWithColor[];

      const result = calculateValueRangeFromLineChartSeries(data);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(42);
    });
  });

  describe('with null/undefined values', () => {
    it('should treat null y values as 0', () => {
      const data: LineChartSeriesWithColor[] = [
        {
          id: 'series1',
          data: [
            { x: 'Jan', y: null },
            { x: 'Feb', y: 50 },
          ],
        },
      ] as unknown as LineChartSeriesWithColor[];

      const result = calculateValueRangeFromLineChartSeries(data);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(50);
    });

    it('should treat undefined y values as 0', () => {
      const data: LineChartSeriesWithColor[] = [
        {
          id: 'series1',
          data: [
            { x: 'Jan', y: undefined },
            { x: 'Feb', y: 30 },
          ],
        },
      ] as unknown as LineChartSeriesWithColor[];

      const result = calculateValueRangeFromLineChartSeries(data);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(30);
    });
  });

  describe('empty data', () => {
    it('should handle empty series array', () => {
      const data: LineChartSeriesWithColor[] = [];

      const result = calculateValueRangeFromLineChartSeries(data);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(0);
    });

    it('should handle series with empty data array', () => {
      const data: LineChartSeriesWithColor[] = [
        {
          id: 'series1',
          data: [],
        },
      ] as unknown as LineChartSeriesWithColor[];

      const result = calculateValueRangeFromLineChartSeries(data);

      expect(result.minimum).toBe(0);
      expect(result.maximum).toBe(0);
    });
  });
});
