import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';

import { TableContext } from '../contexts/TableContext';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../states/savedTableColumnsFamilyState';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';
import type { ColumnDefinition } from '../types/ColumnDefinition';

export const useTableColumns = () => {
  const { onColumnsChange } = useContext(TableContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    TableRecoilScopeContext,
  );
  const setSavedTableColumns = useSetRecoilState(
    savedTableColumnsFamilyState(currentViewId),
  );
  const [tableColumns, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const tableColumnsByKey = useRecoilScopedValue(
    tableColumnsByKeyScopedSelector,
    TableRecoilScopeContext,
  );

  const handleColumnsChange = useCallback(
    async (columns: ColumnDefinition<ViewFieldMetadata>[]) => {
      await onColumnsChange?.(columns);

      setSavedTableColumns(columns);
      setTableColumns(columns);
    },
    [onColumnsChange, setSavedTableColumns, setTableColumns],
  );

  const handleColumnReorder = useCallback(
    async (columns: ColumnDefinition<ViewFieldMetadata>[]) => {
      const updatedColumns = columns.map((column, index) => ({
        ...column,
        index,
      }));

      await handleColumnsChange(updatedColumns);
    },
    [handleColumnsChange],
  );

  const handleColumnVisibilityChange = useCallback(
    async (column: ColumnDefinition<ViewFieldMetadata>) => {
      const nextColumns = tableColumnsByKey[column.key]
        ? tableColumns.map((previousColumn) =>
            previousColumn.key === column.key
              ? { ...previousColumn, isVisible: !column.isVisible }
              : previousColumn,
          )
        : [...tableColumns, { ...column, isVisible: true }].sort(
            (columnA, columnB) => columnA.index - columnB.index,
          );

      await handleColumnsChange(nextColumns);
    },
    [tableColumnsByKey, tableColumns, handleColumnsChange],
  );

  const handleColumnMove = useCallback(
    async (direction: string, column: ColumnDefinition<ViewFieldMetadata>) => {
      const currentColumnArrayIndex = tableColumns.findIndex(
        (tableColumn) => tableColumn.key === column.key,
      );
      const targetColumnArrayIndex =
        direction === 'left'
          ? currentColumnArrayIndex - 1
          : currentColumnArrayIndex + 1;

      if (currentColumnArrayIndex >= 0) {
        const currentColumn = tableColumns[currentColumnArrayIndex];
        const targetColumn = tableColumns[targetColumnArrayIndex];

        const newTableColumns = [...tableColumns];
        newTableColumns[currentColumnArrayIndex] = {
          ...targetColumn,
          index: currentColumn.index,
        };
        newTableColumns[targetColumnArrayIndex] = {
          ...currentColumn,
          index: targetColumn.index,
        };

        await handleColumnsChange(newTableColumns);
      }
    },
    [tableColumns, handleColumnsChange],
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
    handleColumnsChange,
  };
};
