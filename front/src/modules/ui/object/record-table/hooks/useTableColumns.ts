import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { useMoveViewColumns } from '@/ui/object/record-table/hooks/useMoveViewColumns';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useView } from '@/views/hooks/useView';

import { TableContext } from '../contexts/TableContext';
import { availableTableColumnsScopedState } from '../states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../states/savedTableColumnsFamilyState';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';
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

  const visibleTableColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
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

  const handleColumnVisibilityChange = useCallback(
    async (
      viewField: Omit<ColumnDefinition<FieldMetadata>, 'size' | 'position'>,
    ) => {
      const isNewColumn = !tableColumns.some(
        (tableColumns) => tableColumns.fieldId === viewField.fieldId,
      );

      if (isNewColumn) {
        const newColumn = availableTableColumns.find(
          (availableTableColumn) =>
            availableTableColumn.fieldId === viewField.fieldId,
        );
        if (!newColumn) return;

        const nextColumns = [
          ...tableColumns,
          { ...newColumn, isVisible: true },
        ];

        await handleColumnsChange(nextColumns);
      } else {
        const nextColumns = tableColumns.map((previousColumn) =>
          previousColumn.fieldId === viewField.fieldId
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
      const currentColumnArrayIndex = visibleTableColumns.findIndex(
        (visibleColumn) => visibleColumn.fieldId === column.fieldId,
      );

      const columns = handleColumnMove(
        direction,
        currentColumnArrayIndex,
        visibleTableColumns,
      );

      await handleColumnsChange(columns);
    },
    [visibleTableColumns, handleColumnMove, handleColumnsChange],
  );

  const handleColumnReorder = useCallback(
    async (columns: ColumnDefinition<FieldMetadata>[]) => {
      const updatedColumns = columns.map((column, index) => ({
        ...column,
        position: index,
      }));

      await handleColumnsChange(updatedColumns);
    },
    [handleColumnsChange],
  );

  return {
    handleColumnVisibilityChange,
    handleMoveTableColumn,
    handleColumnReorder,
    handleColumnsChange,
  };
};
