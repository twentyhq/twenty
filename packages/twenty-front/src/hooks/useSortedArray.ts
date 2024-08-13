import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSortedArray = <T>(
  arrayToSort: T[],
  tableMetadata: TableMetadata<T>,
): T[] => {
  const sortedFieldByTable = useRecoilValue(
    sortedFieldByTableFamilyState({ tableId: tableMetadata.tableId }),
  );

  const sortedArray = useMemo(() => {
    if (!isDefined(sortedFieldByTable)) {
      return arrayToSort;
    }

    const sortFieldName = sortedFieldByTable.fieldName as keyof T;
    const sortFieldType = tableMetadata.fields.find(
      (field) => field.fieldName === sortFieldName,
    )?.fieldType;
    const sortOrder = sortedFieldByTable.orderBy;

    return arrayToSort.toSorted((a: T, b: T) => {
      if (sortFieldType === 'string') {
        return sortOrder === 'AscNullsLast'
          ? (a[sortFieldName] as string)?.localeCompare(
              b[sortFieldName] as string,
            )
          : (b[sortFieldName] as string)?.localeCompare(
              a[sortFieldName] as string,
            );
      } else if (sortFieldType === 'number') {
        return sortOrder === 'AscNullsLast'
          ? (a[sortFieldName] as number) - (b[sortFieldName] as number)
          : (b[sortFieldName] as number) - (a[sortFieldName] as number);
      } else {
        return 0;
      }
    });
  }, [sortedFieldByTable, arrayToSort, tableMetadata]);

  return sortedArray;
};
