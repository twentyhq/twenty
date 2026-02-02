import { isNumber } from '@sniptt/guards';

import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';

export const computeShouldRoundFreeEndMap = ({
  data,
  keys,
  indexBy,
  groupMode,
}: {
  data: BarChartDatum[];
  keys: string[];
  indexBy: string;
  groupMode?: 'grouped' | 'stacked';
}): Map<string, boolean> | null => {
  if (groupMode !== 'stacked' || !keys?.length || !data?.length || !indexBy) {
    return null;
  }

  const map = new Map<string, boolean>();

  for (const dataPoint of data) {
    const indexValue = dataPoint[indexBy];

    for (let seriesIndex = 0; seriesIndex < keys.length; seriesIndex++) {
      const key = keys[seriesIndex];
      const value = dataPoint[key];

      if (!isNumber(value) || value === 0) {
        continue;
      }

      const isNegative = value < 0;

      const keysAfterCurrent = keys.slice(seriesIndex + 1);
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
