import { isDefined } from 'twenty-shared/utils';

import { type SystemObjectTableColumn } from '@/system-object-table/types/SystemObjectTableColumn';
import { type SystemObjectTableSort } from '@/system-object-table/types/SystemObjectTableSort';
import {
  compareSystemObjectTableSortValues,
  isEmptySystemObjectTableSortValue,
} from '@/system-object-table/utils/compareSystemObjectTableSortValues';

export const getSortedSystemObjectTableItems = <TItem>({
  items,
  columns,
  sort,
}: {
  items: TItem[];
  columns: SystemObjectTableColumn<TItem>[];
  sort: SystemObjectTableSort | null;
}): TItem[] => {
  if (!isDefined(sort)) {
    return items;
  }

  const getSortValue = columns.find(
    (column) => column.key === sort.columnKey,
  )?.getSortValue;

  if (!isDefined(getSortValue)) {
    return items;
  }

  const directionMultiplier = sort.direction === 'asc' ? 1 : -1;

  return [...items].sort((itemA, itemB) => {
    const valueA = getSortValue(itemA);
    const valueB = getSortValue(itemB);

    // Empty values stay last whatever the sort direction
    if (isEmptySystemObjectTableSortValue(valueA)) {
      return isEmptySystemObjectTableSortValue(valueB) ? 0 : 1;
    }

    if (isEmptySystemObjectTableSortValue(valueB)) {
      return -1;
    }

    return (
      directionMultiplier * compareSystemObjectTableSortValues(valueA, valueB)
    );
  });
};
