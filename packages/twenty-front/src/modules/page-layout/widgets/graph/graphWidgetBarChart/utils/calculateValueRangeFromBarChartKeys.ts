import { type ChartValueRange } from '@/page-layout/widgets/graph/types/ChartValueRange';
import { calculateValueRangeFromValues } from '@/page-layout/widgets/graph/utils/calculateValueRangeFromValues';
import { type BarDatum } from '@nivo/bar';

export const calculateValueRangeFromBarChartKeys = (
  data: BarDatum[],
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
