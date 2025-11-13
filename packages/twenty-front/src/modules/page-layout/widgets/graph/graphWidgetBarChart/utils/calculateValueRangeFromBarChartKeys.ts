import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { calculateValueRangeFromValues } from '@/page-layout/widgets/graph/utils/calculateValueRangeFromValues';
import { type ChartValueRange } from '@/page-layout/widgets/graph/types/ChartValueRange';

export const calculateValueRangeFromBarChartKeys = (
  data: BarChartDataItem[],
  keys: string[],
): ChartValueRange => {
  const values: number[] = [];

  for (const item of data) {
    for (const key of keys) {
      const value = Number(item[key] ?? 0);
      values.push(value);
    }
  }

  return calculateValueRangeFromValues(values);
};
