import { useCallback } from 'react';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';
import type { ColumnDefinition } from '../types/ColumnDefinition';

export const useTableColumns = () => {
  const [tableColumns, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const tableColumnsByKey = useRecoilScopedValue(
    tableColumnsByKeyScopedSelector,
    TableRecoilScopeContext,
  );

  const handleColumnReorder = useCallback(
    (columns: ColumnDefinition<ViewFieldMetadata>[]) => {
      const updatedColumnOrder = columns
        .map((column, index) => {
          return { ...column, index };
        })
        .sort((columnA, columnB) => columnA.index - columnB.index);

      setTableColumns(updatedColumnOrder);
    },
    [setTableColumns],
  );

  const handleColumnVisibilityChange = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      const nextColumns = tableColumnsByKey[column.key]
        ? tableColumns.map((previousColumn) =>
            previousColumn.key === column.key
              ? { ...previousColumn, isVisible: !column.isVisible }
              : previousColumn,
          )
        : [...tableColumns, { ...column, isVisible: true }].sort(
            (columnA, columnB) => columnA.index - columnB.index,
          );

      setTableColumns(nextColumns);
    },
    [tableColumnsByKey, tableColumns, setTableColumns],
  );

  const handleColumnMove = useCallback(
    (direction: string, column: ColumnDefinition<ViewFieldMetadata>) => {
      const tableColumnIndex = tableColumns.findIndex(
        (tableColumn) => tableColumn.key === column.key,
      );
      if (tableColumnIndex >= 0) {
        const currentColumn = tableColumns[tableColumnIndex];
        const targetColumn =
          direction === 'left'
            ? tableColumns[tableColumnIndex - 1]
            : tableColumns[tableColumnIndex + 1];
        const updatedColumns = tableColumns
          .map((tableColumn) => {
            switch (tableColumn.key) {
              case targetColumn.key:
                return { ...tableColumn, index: currentColumn.index };
              case currentColumn.key:
                return { ...tableColumn, index: targetColumn.index };
              default:
                return tableColumn;
            }
          })
          .sort((columnA, columnB) => columnA.index - columnB.index);

        setTableColumns(updatedColumns);
      }
    },
    [tableColumns, setTableColumns],
  );

  const handleColumnLeftMove = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      handleColumnMove('left', column);
    },
    [handleColumnMove],
  );

  const handleColumnRightMove = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      handleColumnMove('right', column);
    },
    [handleColumnMove],
  );

  return {
    handleColumnVisibilityChange,
    handleColumnLeftMove,
    handleColumnRightMove,
    handleColumnReorder,
  };
};
