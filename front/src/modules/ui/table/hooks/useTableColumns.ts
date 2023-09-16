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

  const handleColumnMoveLeftChange = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      const tableColumnIndex = tableColumns.findIndex(
        (tableColumn) => tableColumn.key === column.key,
      );
      if (tableColumnIndex >= 0) {
        const lastColumn = tableColumns[tableColumnIndex - 1];
        const nextToLastColumn = tableColumns[tableColumnIndex - 2];
        if (nextToLastColumn) {
          const newIndex = (lastColumn.index + nextToLastColumn.index) / 2;
          const updatedColumns = tableColumns
            .map((previousColumn) =>
              previousColumn.key === column.key
                ? { ...previousColumn, index: newIndex }
                : previousColumn,
            )
            .sort((columnA, columnB) => columnA.index - columnB.index);

          setTableColumns(updatedColumns);
        } else {
          const nextColumn = tableColumns[tableColumnIndex + 1];
          const newIndex = (column.index + nextColumn.index) / 2;
          const updatedColumns = tableColumns
            .map((previousColumn) =>
              previousColumn.key === lastColumn.key
                ? { ...previousColumn, index: newIndex }
                : previousColumn,
            )
            .sort((columnA, columnB) => columnA.index - columnB.index);

          setTableColumns(updatedColumns);
        }
      }
    },
    [tableColumns, setTableColumns],
  );

  const handleColumnMoveRightChange = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      const tableColumnIndex = tableColumns.findIndex(
        (tableColumn) => tableColumn.key === column.key,
      );
      if (tableColumnIndex >= 0) {
        const nextColumn = tableColumns[tableColumnIndex + 1];
        const nextToNextColumn = tableColumns[tableColumnIndex + 2];
        if (nextToNextColumn) {
          const newIndex = (nextColumn.index + nextToNextColumn.index) / 2;
          const updatedColumns = tableColumns
            .map((previousColumn) =>
              previousColumn.key === column.key
                ? { ...previousColumn, index: newIndex }
                : previousColumn,
            )
            .sort((columnA, columnB) => columnA.index - columnB.index);

          setTableColumns(updatedColumns);
        } else {
          const lastColumn = tableColumns[tableColumnIndex - 1];
          const newIndex = (column.index + lastColumn.index) / 2;
          const updatedColumns = tableColumns
            .map((previousColumn) =>
              previousColumn.key === nextColumn.key
                ? { ...previousColumn, index: newIndex }
                : previousColumn,
            )
            .sort((columnA, columnB) => columnA.index - columnB.index);

          setTableColumns(updatedColumns);
        }
      }
    },
    [tableColumns, setTableColumns],
  );

  return {
    handleColumnVisibilityChange,
    handleColumnMoveLeftChange,
    handleColumnMoveRightChange,
  };
};
