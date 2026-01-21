import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { getLineChartTooltipData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartTooltipData';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import {
  type LineSeries,
  type Point,
  type SliceTooltipProps,
} from '@nivo/line';

type MockPointOverrides = {
  seriesId: string;
  dataX?: string | number;
  dataY?: number | string | null;
  pointY?: number;
};

const createMockPoint = ({
  seriesId,
  dataX = 'Jan',
  dataY,
  pointY,
}: MockPointOverrides): Point<LineSeries> => {
  const fallbackValue = dataY ?? pointY ?? 0;
  return {
    id: `${seriesId}-${dataX}`,
    seriesId,
    x: dataX,
    y: pointY ?? Number(dataY ?? 0),
    data: {
      x: dataX,
      y: dataY,
      xFormatted: String(dataX),
      yFormatted: String(fallbackValue),
    },
  } as unknown as Point<LineSeries>;
};

const createMockSlice = (
  points: Point<LineSeries>[],
): SliceTooltipProps<LineSeries>['slice'] =>
  ({
    id: 'slice-1',
    points,
  }) as unknown as SliceTooltipProps<LineSeries>['slice'];

const createSeries = (id: string): LineChartEnrichedSeries =>
  ({
    id,
    label: id,
    data: [],
    colorScheme: {
      name: 'test',
      solid: '#solid',
      variations: Array(12).fill('#v0'),
    },
    areaFillId: `area-${id}`,
  }) as unknown as LineChartEnrichedSeries;

describe('getLineChartTooltipData', () => {
  const formatOptions: GraphValueFormatOptions = {};

  it('should return empty items for empty slice', () => {
    const slice = createMockSlice([]);

    const result = getLineChartTooltipData({
      slice,
      enrichedSeries: [],
      formatOptions,
    });

    expect(result).toEqual({ items: [], indexLabel: undefined });
  });

  it('should sort by value descending when not stacked', () => {
    const enrichedSeries = [createSeries('series1'), createSeries('series2')];
    const slice = createMockSlice([
      createMockPoint({ seriesId: 'series1', dataY: 10 }),
      createMockPoint({ seriesId: 'series2', dataY: 20 }),
    ]);

    const result = getLineChartTooltipData({
      slice,
      enrichedSeries,
      formatOptions,
    });

    expect(result.items.map((item) => item.key)).toEqual([
      'series2',
      'series1',
    ]);
  });

  it('should use series order when values are equal', () => {
    const enrichedSeries = [createSeries('series2'), createSeries('series1')];
    const slice = createMockSlice([
      createMockPoint({ seriesId: 'series1', dataY: 10 }),
      createMockPoint({ seriesId: 'series2', dataY: 10 }),
    ]);

    const result = getLineChartTooltipData({
      slice,
      enrichedSeries,
      formatOptions,
    });

    expect(result.items.map((item) => item.key)).toEqual([
      'series2',
      'series1',
    ]);
  });

  it('should use series order when stacked', () => {
    const enrichedSeries = [createSeries('series2'), createSeries('series1')];
    const slice = createMockSlice([
      createMockPoint({ seriesId: 'series1', dataY: 100 }),
      createMockPoint({ seriesId: 'series2', dataY: 10 }),
    ]);

    const result = getLineChartTooltipData({
      slice,
      enrichedSeries,
      formatOptions,
      isStacked: true,
    });

    expect(result.items.map((item) => item.key)).toEqual([
      'series2',
      'series1',
    ]);
  });

  it('should fall back to point.y when data.y is undefined', () => {
    const enrichedSeries = [createSeries('series1')];
    const slice = createMockSlice([
      createMockPoint({ seriesId: 'series1', dataY: undefined, pointY: 7 }),
    ]);

    const result = getLineChartTooltipData({
      slice,
      enrichedSeries,
      formatOptions,
    });

    expect(result.items[0]?.value).toBe(7);
  });

  it('should ignore points missing from enrichedSeries', () => {
    const enrichedSeries = [createSeries('series1')];
    const slice = createMockSlice([
      createMockPoint({ seriesId: 'missing', dataY: 50 }),
      createMockPoint({ seriesId: 'series1', dataY: 5 }),
    ]);

    const result = getLineChartTooltipData({
      slice,
      enrichedSeries,
      formatOptions,
    });

    expect(result.items.map((item) => item.key)).toEqual(['series1']);
  });
});
