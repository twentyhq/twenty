import { isDefined } from 'twenty-shared/utils';

import { type SystemObjectTableSortValue } from '@/system-object-table/types/SystemObjectTableColumn';

export type SystemObjectTableComparableSortValue = Exclude<
  SystemObjectTableSortValue,
  null | undefined
>;

export const isEmptySystemObjectTableSortValue = (
  value: SystemObjectTableSortValue,
): value is null | undefined | '' => !isDefined(value) || value === '';

const toComparableValue = (
  value: SystemObjectTableComparableSortValue,
): string | number => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  return value;
};

export const compareSystemObjectTableSortValues = (
  valueA: SystemObjectTableComparableSortValue,
  valueB: SystemObjectTableComparableSortValue,
): number => {
  const comparableValueA = toComparableValue(valueA);
  const comparableValueB = toComparableValue(valueB);

  if (
    typeof comparableValueA === 'number' &&
    typeof comparableValueB === 'number'
  ) {
    return comparableValueA - comparableValueB;
  }

  return String(comparableValueA).localeCompare(
    String(comparableValueB),
    undefined,
    {
      sensitivity: 'base',
    },
  );
};
