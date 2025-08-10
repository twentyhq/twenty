import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSortedArray = <T>(
  arrayToSort: T[],
  tableMetadata: TableMetadata<T>,
): T[] => {
  const sortedFieldByTable = useRecoilValue(
    sortedFieldByTableFamilyState({ tableId: tableMetadata.tableId }),
  );

  const initialSort = tableMetadata.initialSort;

  const sortedArray = useMemo(() => {
    const sortValueToUse = isDefined(sortedFieldByTable)
      ? sortedFieldByTable
      : initialSort;

    if (!isDefined(sortValueToUse)) {
      return arrayToSort;
    }

    const sortFieldName = sortValueToUse.fieldName as keyof T;
    const sortFieldType = tableMetadata.fields.find(
      (field) => field.fieldName === sortFieldName,
    )?.fieldType;
    const sortOrder = sortValueToUse.orderBy;

    return [...arrayToSort].sort((a: T, b: T) => {
      if (sortFieldType === 'string') {
        return sortOrder === 'AscNullsLast' || sortOrder === 'AscNullsFirst'
          ? (a[sortFieldName] as string)?.localeCompare(
              b[sortFieldName] as string,
            )
          : (b[sortFieldName] as string)?.localeCompare(
              a[sortFieldName] as string,
            );
      } else if (sortFieldType === 'number') {
        return sortOrder === 'AscNullsLast' || sortOrder === 'AscNullsFirst'
          ? (a[sortFieldName] as number) - (b[sortFieldName] as number)
          : (b[sortFieldName] as number) - (a[sortFieldName] as number);
      } else {
        return 0;
      }
    });
  }, [arrayToSort, tableMetadata, initialSort, sortedFieldByTable]);

  return sortedArray;
};
