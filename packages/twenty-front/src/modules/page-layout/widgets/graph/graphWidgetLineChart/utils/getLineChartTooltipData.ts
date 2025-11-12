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
};

type LineChartTooltipData = {
  items: GraphWidgetTooltipItem[];
  indexLabel: string | undefined;
};

export const getLineChartTooltipData = ({
  slice,
  enrichedSeries,
  formatOptions,
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

  const sortedPoints = [...slice.points].sort((a, b) => a.y - b.y);

  const tooltipItems = sortedPoints
    .map((point) => {
      const enrichedSeriesItem = enrichedSeriesMap.get(String(point.seriesId));
      if (!enrichedSeriesItem) return null;

      const value = Number(point.data.y || 0);
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
