import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { type ChartValueRange } from '@/page-layout/widgets/graph/types/ChartValueRange';
import { calculateValueRangeFromValues } from '@/page-layout/widgets/graph/utils/calculateValueRangeFromValues';

export const calculateValueRangeFromLineChartSeries = (
  data: LineChartSeries[],
): ChartValueRange => {
  const values: number[] = [];

  for (const series of data) {
    for (const point of series.data) {
      const value = Number(point.y);
      values.push(value);
    }
  }

  return calculateValueRangeFromValues(values);
};
