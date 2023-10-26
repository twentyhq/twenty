import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { useMoveViewColumns } from '@/ui/data/data-table/hooks/useMoveViewColumns';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useView } from '@/views/hooks/useView';
import { ViewFieldForVisibility } from '@/views/types/ViewFieldForVisibility';

import { TableContext } from '../contexts/TableContext';
import { availableTableColumnsScopedState } from '../states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../states/savedTableColumnsFamilyState';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';
import { ColumnDefinition } from '../types/ColumnDefinition';

export const useTableColumns = () => {
  const { onColumnsChange } = useContext(TableContext);

  const [availableTableColumns] = useRecoilScopedState(
    availableTableColumnsScopedState,
    TableRecoilScopeContext,
  );

  const { currentViewId } = useView();

  const setSavedTableColumns = useSetRecoilState(
    savedTableColumnsFamilyState(currentViewId),
  );
  const [tableColumns, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );

  const { handleColumnMove } = useMoveViewColumns();

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
    async (viewField: ViewFieldForVisibility) => {
      const isNewColumn = !tableColumns.some(
        (tableColumns) => tableColumns.key === viewField.key,
      );

      if (isNewColumn) {
        const newColumn = availableTableColumns.find(
          (availableTableColumn) => availableTableColumn.key === viewField.key,
        );
        if (!newColumn) return;

        const nextColumns = [
          ...tableColumns,
          { ...newColumn, isVisible: true },
        ];

        await handleColumnsChange(nextColumns);
      } else {
        const nextColumns = tableColumns.map((previousColumn) =>
          previousColumn.key === viewField.key
            ? { ...previousColumn, isVisible: !viewField.isVisible }
            : previousColumn,
        );

        await handleColumnsChange(nextColumns);
      }
    },
    [tableColumns, availableTableColumns, handleColumnsChange],
  );

  const handleMoveTableColumn = useCallback(
    async (
      direction: 'left' | 'right',
      column: ColumnDefinition<FieldMetadata>,
    ) => {
      const currentColumnArrayIndex = tableColumns.findIndex(
        (tableColumn) => tableColumn.key === column.key,
      );
      const columns = handleColumnMove(
        direction,
        currentColumnArrayIndex,
        tableColumns,
      );

      await handleColumnsChange(columns);
    },
    [tableColumns, handleColumnMove, handleColumnsChange],
  );

  return {
    handleColumnVisibilityChange,
    handleMoveTableColumn,
    handleColumnReorder,
    handleColumnsChange,
  };
};
