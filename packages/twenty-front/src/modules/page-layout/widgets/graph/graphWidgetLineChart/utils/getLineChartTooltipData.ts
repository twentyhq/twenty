import { type GraphWidgetTooltipItem } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { type LineSeries, type SliceTooltipProps } from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';

type GetLineChartTooltipDataParameters = {
  slice: SliceTooltipProps<LineSeries>['slice'];
  enrichedSeries: LineChartEnrichedSeries[];
  formatOptions: GraphValueFormatOptions;
  isStacked?: boolean;
};

type LineChartTooltipData = {
  items: GraphWidgetTooltipItem[];
  indexLabel: string | undefined;
};

export const getLineChartTooltipData = ({
  slice,
  enrichedSeries,
  formatOptions,
  isStacked = false,
}: GetLineChartTooltipDataParameters): LineChartTooltipData => {
  const enrichedSeriesMap = new Map(
    enrichedSeries.map((series) => [series.id, series]),
  );

  if (!isDefined(slice.points) || slice.points.length === 0) {
    return {
      items: [],
      indexLabel: undefined,
    };
  }

  const seriesIndexMap = new Map(
    enrichedSeries.map((series, index) => [series.id, index]),
  );

  const getPointValue = (point: (typeof slice.points)[number]) =>
    Number(point.data.y ?? point.y ?? 0);

  const getSeriesIndex = (seriesId: string) =>
    seriesIndexMap.get(seriesId) ?? seriesIndexMap.size;

  const sortedPoints = slice.points.toSorted((a, b) => {
    if (!isStacked) {
      const valueDiff = getPointValue(b) - getPointValue(a);
      if (valueDiff !== 0) {
        return valueDiff;
      }
    }
    return (
      getSeriesIndex(String(a.seriesId)) - getSeriesIndex(String(b.seriesId))
    );
  });

  const tooltipItems = sortedPoints
    .map((point) => {
      const enrichedSeriesItem = enrichedSeriesMap.get(String(point.seriesId));
      if (!enrichedSeriesItem) return null;

      const value = getPointValue(point);
      return {
        key: enrichedSeriesItem.id,
        label: enrichedSeriesItem.label,
        formattedValue: formatGraphValue(value, formatOptions),
        value,
        dotColor: enrichedSeriesItem.colorScheme.solid,
      };
    })
    .filter(isDefined);

  const xValue = slice.points[0]?.data?.x;

  return {
    items: tooltipItems,
    indexLabel: isDefined(xValue) ? String(xValue) : undefined,
  };
};
