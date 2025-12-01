import { type BarDatum } from '@nivo/bar';

export const applyCumulativeTransformToTwoDimensionalBarChartData = (
  data: BarDatum[],
  keys: string[],
): BarDatum[] => {
  const runningTotals: Record<string, number> = Object.fromEntries(
    keys.map((key) => [key, 0]),
  );

  return data.map((datum) => {
    const newDatum = { ...datum };

    for (const key of keys) {
      const value = datum[key];

      if (typeof value === 'number') {
        runningTotals[key] += value;
      }

      newDatum[key] = runningTotals[key];
    }

    return newDatum;
  });
};
