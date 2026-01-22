import { type BarDatum } from '@nivo/bar';
import { isNumber } from '@sniptt/guards';

type ComputeShouldRoundFreeEndMapParams = {
  data: BarDatum[];
  orderedKeys: string[];
  indexBy: string;
  groupMode?: 'grouped' | 'stacked';
};

export const computeShouldRoundFreeEndMap = ({
  data,
  orderedKeys,
  indexBy,
  groupMode,
}: ComputeShouldRoundFreeEndMapParams): Map<string, boolean> | null => {
  if (
    groupMode !== 'stacked' ||
    !orderedKeys?.length ||
    !data?.length ||
    !indexBy
  ) {
    return null;
  }

  const map = new Map<string, boolean>();

  for (const dataPoint of data) {
    const indexValue = dataPoint[indexBy];

    for (let seriesIndex = 0; seriesIndex < orderedKeys.length; seriesIndex++) {
      const key = orderedKeys[seriesIndex];
      const value = dataPoint[key];

      if (!isNumber(value) || value === 0) {
        continue;
      }

      const isNegative = value < 0;

      const keysAfterCurrent = orderedKeys.slice(seriesIndex + 1);
      const hasSameSignBarAfter = keysAfterCurrent.some((afterKey) => {
        const afterValue = dataPoint[afterKey];
        return (
          isNumber(afterValue) && (isNegative ? afterValue < 0 : afterValue > 0)
        );
      });

      map.set(JSON.stringify([indexValue, key]), !hasSameSignBarAfter);
    }
  }

  return map;
};
