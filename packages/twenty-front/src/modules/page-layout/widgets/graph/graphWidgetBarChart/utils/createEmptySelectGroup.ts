import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';

export const createEmptySelectGroup = (
  dimensionValues: (string | null)[],
  aggregateKeys: string[],
): GroupByRawResult => {
  const newItem: GroupByRawResult = {
    groupByDimensionValues: dimensionValues,
  };

  for (const key of aggregateKeys) {
    newItem[key] = 0;
  }

  return newItem;
};
