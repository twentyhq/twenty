import { useState } from 'react';

enum sortOrders {
  ascending = 'ascending',
  descending = 'descending',
}
type SortConfig<T> = {
  sortByColumnKey: keyof T;
  sortOrder: sortOrders;
};

export const useTableSort = <T>(
  initialColumnKey: keyof T,
  tableData: T[],
): [T[], (sortKey: keyof T) => void, SortConfig<T>] => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    sortByColumnKey: initialColumnKey,
    sortOrder: sortOrders.ascending,
  });

  const sortTableData = (
    data: T[],
    columnKey: keyof T,
    order: sortOrders,
  ): T[] => {
    return data.sort((a: T, b: T) => {
      if (typeof a[columnKey] === 'string') {
        return order === sortOrders.ascending
          ? (a[columnKey] as string).localeCompare(b[columnKey] as string)
          : (b[columnKey] as string).localeCompare(a[columnKey] as string);
      } else if (typeof a[columnKey] === 'number') {
        return order === sortOrders.ascending
          ? (a[columnKey] as number) - (b[columnKey] as number)
          : (b[columnKey] as number) - (a[columnKey] as number);
      } else return 0;
    });
  };

  const sortedTableData = sortTableData(
    [...tableData],
    sortConfig.sortByColumnKey,
    sortConfig.sortOrder,
  );

  const toggleSortOrder = (sortOrder: sortOrders) => {
    return sortOrder === sortOrders.ascending
      ? sortOrders.descending
      : sortOrders.ascending;
  };

  const handleSortClick = (columnKey: keyof T) => {
    setSortConfig((state) => ({
      sortByColumnKey: columnKey,
      sortOrder:
        state.sortByColumnKey === columnKey
          ? toggleSortOrder(state.sortOrder)
          : sortOrders.ascending,
    }));
  };

  return [sortedTableData, handleSortClick, sortConfig];
};
