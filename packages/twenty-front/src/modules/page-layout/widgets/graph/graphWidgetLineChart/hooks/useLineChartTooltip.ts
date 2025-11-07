import { type LineChartEnrichedSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartEnrichedSeries';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import {
  type LineSeries,
  type Point,
  type SliceTooltipProps,
} from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';

type UseLineChartTooltipProps = {
  dataMap: Record<string, LineChartSeries>;
  enrichedSeries: LineChartEnrichedSeries[];
  formatOptions: GraphValueFormatOptions;
};

export const useLineChartTooltip = ({
  dataMap,
  enrichedSeries,
  formatOptions,
}: UseLineChartTooltipProps) => {
  const enrichedSeriesMap = new Map(
    enrichedSeries.map((series) => [series.id, series]),
  );

  const createSliceTooltipData = ({ slice }: SliceTooltipProps<LineSeries>) => {
    if (!isDefined(slice.points) || slice.points.length === 0) {
      return {
        items: [],
        showClickHint: false,
        indexLabel: undefined,
      };
    }

    const tooltipItems = slice.points
      .map((point) => {
        const enrichedSeriesItem = enrichedSeriesMap.get(
          String(point.seriesId),
        );
        if (!enrichedSeriesItem) return null;

        const value = Number(point.data.y || 0);
        return {
          label: enrichedSeriesItem.label,
          formattedValue: formatGraphValue(value, formatOptions),
          value,
          dotColor: enrichedSeriesItem.colorScheme.solid,
        };
      })
      .filter(isDefined);

    const hasClickablePoint = slice.points.some((point) => {
      const series = dataMap[point.seriesId];
      if (isDefined(series)) {
        const dataPoint = series.data[point.indexInSeries];
        return isDefined(dataPoint?.to);
      }
      return false;
    });

    const xValue = slice.points[0]?.data?.x;

    return {
      items: tooltipItems,
      showClickHint: hasClickablePoint,
      indexLabel: isDefined(xValue) ? String(xValue) : undefined,
    };
  };

  const createPointTooltipData = (point: Point<LineSeries>) => {
    const enrichedSeriesItem = enrichedSeriesMap.get(String(point.seriesId));
    if (!enrichedSeriesItem) return null;

    const series = dataMap[point.seriesId];
    const dataPoint = series?.data[point.indexInSeries];

    const value = Number(point.data.y || 0);
    return {
      items: [
        {
          label: enrichedSeriesItem.label,
          formattedValue: formatGraphValue(value, formatOptions),
          value,
          dotColor: enrichedSeriesItem.colorScheme.solid,
        },
      ],
      showClickHint: isDefined(dataPoint?.to),
      indexLabel: isDefined(point.data.x) ? String(point.data.x) : undefined,
    };
  };

  return {
    createSliceTooltipData,
    createPointTooltipData,
  };
};
