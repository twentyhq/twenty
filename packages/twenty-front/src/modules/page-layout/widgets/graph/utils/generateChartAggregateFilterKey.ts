export const generateChartAggregateFilterKey = (
  rangeMin?: number | null,
  rangeMax?: number | null,
  omitNullValues?: boolean | null,
): string => {
  return `${rangeMin ?? ''}-${rangeMax ?? ''}-${omitNullValues ?? ''}`;
};
