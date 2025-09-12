import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type LineSeries, type Point } from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';

export const handleLineChartPointClick = (
  point: Point<LineSeries>,
  dataMap: Record<string, LineChartSeries>,
) => {
  const series = dataMap[point.seriesId];
  if (isDefined(series)) {
    const dataPoint = series.data[point.indexInSeries];
    if (isDefined(dataPoint?.to)) {
      window.location.href = dataPoint.to;
    }
  }
};
