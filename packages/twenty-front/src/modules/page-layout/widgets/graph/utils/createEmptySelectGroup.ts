import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';

export const createEmptySelectGroup = (
  dimensionValues: RawDimensionValue[],
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
