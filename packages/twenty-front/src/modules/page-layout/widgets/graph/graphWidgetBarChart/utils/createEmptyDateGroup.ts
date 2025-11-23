import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';

export type DimensionValue = string | Date | number | null;

export const createEmptyDateGroup = (
  dimensionValues: DimensionValue[],
  keys: string[],
): GroupByRawResult => {
  const newItem: GroupByRawResult = {
    groupByDimensionValues: dimensionValues.map((value) =>
      value instanceof Date ? value.toISOString() : value,
    ),
  };

  for (const key of keys) {
    newItem[key] = 0;
  }

  return newItem;
};
