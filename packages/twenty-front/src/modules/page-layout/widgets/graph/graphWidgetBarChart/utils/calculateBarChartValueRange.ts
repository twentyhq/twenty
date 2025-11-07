import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';

type ValueRange = {
  min: number;
  max: number;
};

export const calculateBarChartValueRange = (
  data: BarChartDataItem[],
  keys: string[],
): ValueRange => {
  let min = 0;
  let max = 0;

  for (const item of data) {
    for (const key of keys) {
      const value = Number(item[key] ?? 0);
      if (!isNaN(value)) {
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }
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
