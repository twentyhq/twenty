import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';

type ValueRange = {
  min: number;
  max: number;
};

export const calculateStackedBarChartValueRange = (
  data: BarChartDataItem[],
  keys: string[],
): ValueRange => {
  let minimumValue = 0;
  let maximumValue = 0;

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

    maximumValue = Math.max(maximumValue, positiveSummation);
    minimumValue = Math.min(minimumValue, negativeSummation);
  }

  minimumValue = Math.min(minimumValue, 0);
  maximumValue = Math.max(maximumValue, 0);

  return { min: minimumValue, max: maximumValue };
};
