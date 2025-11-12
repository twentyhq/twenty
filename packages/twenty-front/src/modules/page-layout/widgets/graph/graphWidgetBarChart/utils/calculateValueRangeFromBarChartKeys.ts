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
      if (isNaN(value)) {
        continue;
      }

      minimumValue = Math.min(minimumValue, value);
      maximumValue = Math.max(maximumValue, value);
    }
  }

  minimumValue = Math.min(minimumValue, 0);
  maximumValue = Math.max(maximumValue, 0);

  return { min: minimumValue, max: maximumValue };
};
