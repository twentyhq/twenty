import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartEnrichedSeries';
import { getLineChartTooltipData } from '@/page-layout/widgets/graph/graph-widget-line-chart/utils/getLineChartTooltipData';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import {
  type LineSeries,
  type Point,
  type SliceTooltipProps,
} from '@nivo/line';

type MockPointOverrides = {
  seriesId: string;
  dataX?: string | number;
  dataY: number | string | null;
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
    indexInSeries: 0,
    absIndex: 0,
    seriesIndex: 0,
    seriesId,
    seriesColor: '#color',
    color: '#color',
    borderColor: '#color',
    x: 0,
    y: pointY ?? Number(dataY ?? 0),
    data: {
      x: dataX,
      y: dataY,
      xFormatted: String(dataX),
      yFormatted: String(fallbackValue),
    },
  };
};

const createMockSlice = (
  points: Point<LineSeries>[],
): SliceTooltipProps<LineSeries>['slice'] => ({
  id: 'slice-1',
  x0: 0,
  x: 0,
  y0: 0,
  y: 0,
  width: 0,
  height: 0,
  points,
});

const createSeries = (key: string): LineChartEnrichedSeries => ({
  key,
  label: key,
  data: [],
  colorScheme: {
    name: 'test',
    solid: '#solid',
    variations: [
      '#v0',
      '#v1',
      '#v2',
      '#v3',
      '#v4',
      '#v5',
      '#v6',
      '#v7',
      '#v8',
      '#v9',
      '#v10',
      '#v11',
    ],
  },
  areaFillId: `area-${key}`,
});

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

  it('should fall back to point.y when data.y is null', () => {
    const enrichedSeries = [createSeries('series1')];
    const slice = createMockSlice([
      createMockPoint({ seriesId: 'series1', dataY: null, pointY: 7 }),
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
