import { type LineChartDataPoint } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartDataPoint';
import { isDefined } from 'twenty-shared/utils';

type ApplyCumulativeTransformToLineChartDataOptions = {
  data: LineChartDataPoint[];
  rangeMin?: number;
  rangeMax?: number;
};

export const applyCumulativeTransformToLineChartData = ({
  data,
  rangeMin,
  rangeMax,
}: ApplyCumulativeTransformToLineChartDataOptions): LineChartDataPoint[] => {
  const { result } = data.reduce<{
    result: LineChartDataPoint[];
    runningTotal: number;
  }>(
    (accumulator, point) => {
      if (point.y !== null) {
        accumulator.runningTotal += point.y;
      }

      const cumulativeValue = accumulator.runningTotal;

      const isOutOfRange =
        (isDefined(rangeMin) && cumulativeValue < rangeMin) ||
        (isDefined(rangeMax) && cumulativeValue > rangeMax);

      if (!isOutOfRange) {
        accumulator.result.push({ ...point, y: cumulativeValue });
      }

      return accumulator;
    },
    { result: [], runningTotal: 0 },
  );

  return result;
};
