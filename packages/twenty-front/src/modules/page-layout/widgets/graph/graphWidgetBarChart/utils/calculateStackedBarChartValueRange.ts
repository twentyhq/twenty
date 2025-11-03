import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';

type ValueRange = {
  min: number;
  max: number;
};

export const calculateStackedBarChartValueRange = (
  data: BarChartDataItem[],
  keys: string[],
): ValueRange => {
  let min = 0;
  let max = 0;

  for (const item of data) {
    let positiveSum = 0;
    let negativeSum = 0;

    for (const key of keys) {
      const value = Number(item[key] ?? 0);
      if (!Number.isNaN(value)) {
        if (value >= 0) {
          positiveSum += value;
        } else {
          negativeSum += value;
        }
      }
    }

    if (positiveSum > max) {
      max = positiveSum;
    }
    if (negativeSum < min) {
      min = negativeSum;
    }
  }

  if (min > 0) {
    min = 0;
  }
  if (max < 0) {
    max = 0;
  }

  return { min, max };
};
