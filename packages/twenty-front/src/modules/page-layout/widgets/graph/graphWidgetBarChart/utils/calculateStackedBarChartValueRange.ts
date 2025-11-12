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
      if (!Number.isNaN(value)) {
        if (value >= 0) {
          positiveSummation += value;
        } else {
          negativeSummation += value;
        }
      }
    }

    if (positiveSummation > maximumValue) {
      maximumValue = positiveSummation;
    }
    if (negativeSummation < minimumValue) {
      minimumValue = negativeSummation;
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
