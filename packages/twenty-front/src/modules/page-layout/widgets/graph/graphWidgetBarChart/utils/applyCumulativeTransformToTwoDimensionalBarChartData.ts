import { type BarDatum } from '@nivo/bar';
import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type ApplyCumulativeTransformToTwoDimensionalBarChartDataOptions = {
  data: BarDatum[];
  keys: string[];
  rangeMin?: number | null;
  rangeMax?: number | null;
};

export const applyCumulativeTransformToTwoDimensionalBarChartData = ({
  data,
  keys,
  rangeMin,
  rangeMax,
}: ApplyCumulativeTransformToTwoDimensionalBarChartDataOptions): BarDatum[] => {
  const { result } = data.reduce<{
    result: BarDatum[];
    runningTotals: Record<string, number>;
  }>(
    (accumulator, datum) => {
      const newDatum = { ...datum };

      for (const key of keys) {
        const value = datum[key];

        if (isNumber(value)) {
          accumulator.runningTotals[key] += value;
        }

        newDatum[key] = accumulator.runningTotals[key];
      }

      const totalValue = keys.reduce((sum, key) => {
        const value = newDatum[key];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);

      const isOutOfRange =
        (isDefined(rangeMin) && totalValue < rangeMin) ||
        (isDefined(rangeMax) && totalValue > rangeMax);

      if (!isOutOfRange) {
        accumulator.result.push(newDatum);
      }

      return accumulator;
    },
    {
      result: [],
      runningTotals: Object.fromEntries(keys.map((key) => [key, 0])),
    },
  );

  return result;
};
