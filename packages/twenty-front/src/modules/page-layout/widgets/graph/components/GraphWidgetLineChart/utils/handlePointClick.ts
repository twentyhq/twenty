import { type LineSeries, type Point } from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';
import { type LineChartSeries } from '../types/LineChartSeries';

export const handlePointClick = (
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
