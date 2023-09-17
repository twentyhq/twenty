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

  const handleColumnLeftMove = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      const tableColumnIndex = tableColumns.findIndex(
        (tableColumn) => tableColumn.key === column.key,
      );
      if (tableColumnIndex >= 0) {
        const previousColumn = tableColumns[tableColumnIndex - 1];
        const updatedColumns = tableColumns
          .map((tableColumn) => {
            switch (tableColumn.key) {
              case previousColumn.key:
                return { ...tableColumn, index: column.index };
              case column.key:
                return { ...tableColumn, index: previousColumn.index };
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

  const handleColumnRightMove = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      const tableColumnIndex = tableColumns.findIndex(
        (tableColumn) => tableColumn.key === column.key,
      );
      if (tableColumnIndex >= 0) {
        const nextColumn = tableColumns[tableColumnIndex + 1];
        const updatedColumns = tableColumns
          .map((tableColumn) => {
            switch (tableColumn.key) {
              case nextColumn.key:
                return { ...tableColumn, index: column.index };
              case column.key:
                return { ...tableColumn, index: nextColumn.index };
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

  return {
    handleColumnVisibilityChange,
    handleColumnLeftMove,
    handleColumnRightMove,
  };
};
