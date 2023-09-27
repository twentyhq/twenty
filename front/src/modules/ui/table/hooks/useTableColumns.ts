import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { ViewFieldForVisibility } from '@/ui/view-bar/types/ViewFieldForVisibility';

import { TableContext } from '../contexts/TableContext';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../states/savedTableColumnsFamilyState';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';
import { ColumnDefinition } from '../types/ColumnDefinition';

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

  const handleColumnsChange = useCallback(
    async (columns: ColumnDefinition<FieldMetadata>[]) => {
      setSavedTableColumns(columns);
      setTableColumns(columns);

      await onColumnsChange?.(columns);
    },
    [onColumnsChange, setSavedTableColumns, setTableColumns],
  );

  const handleColumnReorder = useCallback(
    async (columns: ColumnDefinition<FieldMetadata>[]) => {
      const updatedColumns = columns.map((column, index) => ({
        ...column,
        index,
      }));

      await handleColumnsChange(updatedColumns);
    },
    [handleColumnsChange],
  );

  const handleColumnVisibilityChange = useCallback(
    async (column: ViewFieldForVisibility) => {
      const nextColumns = tableColumns.map((previousColumn) =>
        previousColumn.key === column.key
          ? { ...previousColumn, isVisible: !column.isVisible }
          : previousColumn,
      );

      await handleColumnsChange(nextColumns);
    },
    [tableColumns, handleColumnsChange],
  );

  const handleColumnMove = useCallback(
    async (direction: string, column: ColumnDefinition<FieldMetadata>) => {
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
    (column: ColumnDefinition<FieldMetadata>) => {
      handleColumnMove('left', column);
    },
    [handleColumnMove],
  );

  const handleColumnRightMove = useCallback(
    (column: ColumnDefinition<FieldMetadata>) => {
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
