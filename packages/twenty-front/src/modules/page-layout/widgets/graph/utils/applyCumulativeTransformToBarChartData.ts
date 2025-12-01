import { type BarDatum } from '@nivo/bar';

export const applyCumulativeTransformToBarChartData = (
  data: BarDatum[],
  aggregateKey: string,
): BarDatum[] => {
  let runningTotal = 0;

  return data.map((datum) => {
    const value = datum[aggregateKey];

    if (typeof value === 'number') {
      runningTotal += value;
    }

    return { ...datum, [aggregateKey]: runningTotal };
  });
};
