import { calculateBarChartEndLineCoordinates } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateBarChartEndLineCoordinates';
import { type BarDatum, type ComputedBarDatum } from '@nivo/bar';
import { BarChartLayout } from '~/generated/graphql';

describe('calculateBarChartEndLineCoordinates', () => {
  const createMockBar = (
    overrides?: Partial<ComputedBarDatum<BarDatum>>,
  ): ComputedBarDatum<BarDatum> =>
    ({
      x: 100,
      y: 50,
      width: 40,
      height: 80,
      color: 'url(#gradient-test)',
      data: {
        id: 'sales',
        value: 100,
        index: 0,
        indexValue: 'Q1',
        data: { Q1: 100 } as BarDatum,
        formattedValue: '100',
        hidden: false,
      },
      label: 'Sales',
      ...overrides,
    }) as ComputedBarDatum<BarDatum>;
  describe('vertical layout', () => {
    it('should calculate horizontal line coordinates at the top of vertical bars', () => {
      const mockBar = createMockBar();
      const result = calculateBarChartEndLineCoordinates(
        mockBar,
        BarChartLayout.VERTICAL,
      );
      expect(result).toEqual({
        x1: 100,
        x2: 140,
        y1: 50,
        y2: 50,
      });
    });
    it('should handle bars at origin position', () => {
      const barAtOrigin = createMockBar({ x: 0, y: 0 });
      const result = calculateBarChartEndLineCoordinates(
        barAtOrigin,
        BarChartLayout.VERTICAL,
      );
      expect(result).toEqual({
        x1: 0,
        x2: 40,
        y1: 0,
        y2: 0,
      });
    });
    it('should handle bars with negative positions', () => {
      const negativeBar = createMockBar({ x: -50, y: -20 });
      const result = calculateBarChartEndLineCoordinates(
        negativeBar,
        BarChartLayout.VERTICAL,
      );
      expect(result).toEqual({
        x1: -50,
        x2: -10,
        y1: -20,
        y2: -20,
      });
    });
  });
  describe('horizontal layout', () => {
    it('should calculate vertical line coordinates at the end of horizontal bars', () => {
      const mockBar = createMockBar();
      const result = calculateBarChartEndLineCoordinates(
        mockBar,
        BarChartLayout.HORIZONTAL,
      );
      expect(result).toEqual({
        x1: 140,
        x2: 140,
        y1: 50,
        y2: 130,
      });
    });
    it('should handle bars with different dimensions', () => {
      const wideBar = createMockBar({ width: 100, height: 20 });
      const result = calculateBarChartEndLineCoordinates(
        wideBar,
        BarChartLayout.HORIZONTAL,
      );
      expect(result).toEqual({
        x1: 200,
        x2: 200,
        y1: 50,
        y2: 70,
      });
    });
    it('should handle very thin bars', () => {
      const thinBar = createMockBar({ width: 1, height: 200 });
      const result = calculateBarChartEndLineCoordinates(
        thinBar,
        BarChartLayout.HORIZONTAL,
      );
      expect(result).toEqual({
        x1: 101,
        x2: 101,
        y1: 50,
        y2: 250,
      });
    });
  });
});
