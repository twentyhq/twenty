import { type BarDatum } from '@nivo/bar';
import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ApplyCumulativeTransformToBarChartDataOptions = {
  data: BarDatum[];
  aggregateKey: string;
  rangeMin?: number;
  rangeMax?: number;
};

export const applyCumulativeTransformToBarChartData = ({
  data,
  aggregateKey,
  rangeMin,
  rangeMax,
}: ApplyCumulativeTransformToBarChartDataOptions): BarDatum[] => {
  const { result } = data.reduce<{ result: BarDatum[]; runningTotal: number }>(
    (accumulator, datum) => {
      const value = datum[aggregateKey];

      if (isNumber(value)) {
        accumulator.runningTotal += value;
      }

      const cumulativeValue = accumulator.runningTotal;

      const isOutOfRange =
        (isDefined(rangeMin) && cumulativeValue < rangeMin) ||
        (isDefined(rangeMax) && cumulativeValue > rangeMax);

      if (!isOutOfRange) {
        accumulator.result.push({ ...datum, [aggregateKey]: cumulativeValue });
      }

      return accumulator;
    },
    { result: [], runningTotal: 0 },
  );

  return result;
};
