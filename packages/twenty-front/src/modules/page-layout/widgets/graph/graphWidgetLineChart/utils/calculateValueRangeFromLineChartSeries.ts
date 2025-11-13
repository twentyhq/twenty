import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { calculateValueRangeFromValues } from '@/page-layout/widgets/graph/utils/calculateValueRangeFromValues';
import { type ChartValueRange } from '@/page-layout/widgets/graph/types/ChartValueRange';

export const calculateValueRangeFromLineChartSeries = (
  data: LineChartSeries[],
): ChartValueRange => {
  const values: number[] = [];

  for (const series of data) {
    for (const point of series.data) {
      const value = Number(point.y ?? 0);
      values.push(value);
    }
  }

  return calculateValueRangeFromValues(values);
};
