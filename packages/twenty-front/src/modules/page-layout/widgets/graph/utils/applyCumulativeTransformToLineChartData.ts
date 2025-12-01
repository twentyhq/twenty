import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';

export const applyCumulativeTransformToLineChartData = (
  data: LineChartDataPoint[],
): LineChartDataPoint[] => {
  let runningTotal = 0;

  return data.map((point) => {
    if (point.y !== null) {
      runningTotal += point.y;
    }
    return { ...point, y: runningTotal };
  });
};
