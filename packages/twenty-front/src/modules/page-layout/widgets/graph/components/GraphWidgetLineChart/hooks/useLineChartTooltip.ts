import {
  type Point,
  type SliceTooltipProps,
  type LineSeries,
} from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../../../utils/graphFormatters';
import { type LineChartSeries } from '../types/LineChartSeries';
import { type LineChartEnrichedSeries } from '../types/LineChartEnrichedSeries';

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
