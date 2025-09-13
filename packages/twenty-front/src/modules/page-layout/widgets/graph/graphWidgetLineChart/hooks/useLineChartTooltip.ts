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
  const renderSliceTooltip = ({ slice }: SliceTooltipProps<LineSeries>) => {
    const tooltipItems = slice.points
      .map((point) => {
        const enrichedSeriesItem = enrichedSeries.find(
          (s) => s.id === point.seriesId,
        );
        if (!enrichedSeriesItem) return null;

        return {
          label: enrichedSeriesItem.label,
          formattedValue: formatGraphValue(
            Number(point.data.y || 0),
            formatOptions,
          ),
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

    return {
      items: tooltipItems,
      showClickHint: hasClickablePoint,
    };
  };

  const renderPointTooltip = (point: Point<LineSeries>) => {
    const enrichedSeriesItem = enrichedSeries.find(
      (s) => s.id === point.seriesId,
    );
    if (!enrichedSeriesItem) return null;

    const series = dataMap[point.seriesId];
    const dataPoint = series?.data[point.indexInSeries];

    return {
      items: [
        {
          label: enrichedSeriesItem.label,
          formattedValue: formatGraphValue(
            Number(point.data.y || 0),
            formatOptions,
          ),
          dotColor: enrichedSeriesItem.colorScheme.solid,
        },
      ],
      showClickHint: isDefined(dataPoint?.to),
    };
  };

  return {
    renderSliceTooltip,
    renderPointTooltip,
  };
};
