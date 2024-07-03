import { useRecoilValue } from 'recoil';

import { tableSortFamilyState } from '@/activities/states/tabelSortFamilyState';
import { OrderBy } from '@/object-metadata/types/OrderBy';

export const useSortedArray = <T>(
  arrayToSort: T[],
  { tableId, initialFieldName }: { tableId: string; initialFieldName: string },
): T[] => {
  const sortConfig = useRecoilValue(
    tableSortFamilyState({ tableId, initialFieldName }),
  );

  const sortTableData = (
    data: T[],
    columnKey: keyof T,
    order: OrderBy | null,
  ): T[] => {
    return data.sort((a: T, b: T) => {
      if (typeof a[columnKey] === 'string') {
        return order === 'AscNullsLast'
          ? (a[columnKey] as string).localeCompare(b[columnKey] as string)
          : (b[columnKey] as string).localeCompare(a[columnKey] as string);
      } else if (typeof a[columnKey] === 'number') {
        return order === 'AscNullsLast'
          ? (a[columnKey] as number) - (b[columnKey] as number)
          : (b[columnKey] as number) - (a[columnKey] as number);
      } else return 0;
    });
  };

  const sortedTableData = sortTableData(
    [...arrayToSort],
    sortConfig.fieldName as keyof T,
    sortConfig.orderBy,
  );

  return sortedTableData;
};
