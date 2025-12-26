import { type GroupByRawResult } from '@/page-layout/widgets/graph/types/GroupByRawResult';
import { Temporal } from 'temporal-polyfill';

export type DimensionValue = string | Temporal.PlainDate | number | null;

export const createEmptyDateGroup = (
  dimensionValues: DimensionValue[],
  keys: string[],
): GroupByRawResult => {
  const newItem: GroupByRawResult = {
    groupByDimensionValues: dimensionValues.map((value) =>
      value instanceof Temporal.PlainDate ? value.toString() : value,
    ),
  };

  for (const key of keys) {
    newItem[key] = 0;
  }

  return newItem;
};
