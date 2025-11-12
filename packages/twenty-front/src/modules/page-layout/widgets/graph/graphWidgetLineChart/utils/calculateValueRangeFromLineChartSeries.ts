import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';

type ValueRange = {
  min: number;
  max: number;
};

export const calculateValueRangeFromLineChartSeries = (
  data: LineChartSeries[],
): ValueRange => {
  let minimumValue = 0;
  let maximumValue = 0;

  for (const series of data) {
    for (const point of series.data) {
      const value = Number(point.y ?? 0);
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
