import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';

type ValueRange = {
  min: number;
  max: number;
};

export const calculateValueRangeFromBarChartKeys = (
  data: BarChartDataItem[],
  keys: string[],
): ValueRange => {
  let minimumValue = 0;
  let maximumValue = 0;

  for (const item of data) {
    for (const key of keys) {
      const value = Number(item[key] ?? 0);
      if (!isNaN(value)) {
        if (value < minimumValue) {
          minimumValue = value;
        }
        if (value > maximumValue) {
          maximumValue = value;
        }
      }
    }
  }

  if (minimumValue > 0) {
    minimumValue = 0;
  }
  if (maximumValue < 0) {
    maximumValue = 0;
  }

  return { min: minimumValue, max: maximumValue };
};
