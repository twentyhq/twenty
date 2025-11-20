import { type ChartValueRange } from '@/page-layout/widgets/graph/types/ChartValueRange';
import { calculateValueRangeFromValues } from '@/page-layout/widgets/graph/utils/calculateValueRangeFromValues';
import { type BarDatum } from '@nivo/bar';

export const calculateStackedBarChartValueRange = (
  data: BarDatum[],
  keys: string[],
): ChartValueRange => {
  const stackedValues: number[] = [];

  for (const item of data) {
    let positiveSummation = 0;
    let negativeSummation = 0;

    for (const key of keys) {
      const value = Number(item[key] ?? 0);
      if (Number.isNaN(value)) {
        continue;
      }

      if (value >= 0) {
        positiveSummation += value;
      } else {
        negativeSummation += value;
      }
    }

    stackedValues.push(positiveSummation, negativeSummation);
  }

  return calculateValueRangeFromValues(stackedValues);
};
