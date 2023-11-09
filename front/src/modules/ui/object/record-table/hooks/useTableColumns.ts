import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';
import { useView } from '@/views/hooks/useView';

import { savedTableColumnsFamilyState } from '../states/savedTableColumnsFamilyState';
import { ColumnDefinition } from '../types/ColumnDefinition';

import { useRecordTableScopedStates } from './internal/useRecordTableScopedStates';

export const useTableColumns = () => {
  const { onColumnsChange, setTableColumns } = useRecordTable();
  const {
    availableTableColumnsState,
    tableColumnsState,
    visibleTableColumnsSelector,
  } = useRecordTableScopedStates();

  const availableTableColumns = useRecoilValue(availableTableColumnsState);

  const { currentViewId } = useView();

  const setSavedTableColumns = useSetRecoilState(
    savedTableColumnsFamilyState(currentViewId),
  );

  const tableColumns = useRecoilValue(tableColumnsState);
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector);

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
        (tableColumns) =>
          tableColumns.fieldMetadataId === viewField.fieldMetadataId,
      );

      if (isNewColumn) {
        const newColumn = availableTableColumns.find(
          (availableTableColumn) =>
            availableTableColumn.fieldMetadataId === viewField.fieldMetadataId,
        );
        if (!newColumn) return;

        const nextColumns = [
          ...tableColumns,
          { ...newColumn, isVisible: true },
        ];

        await handleColumnsChange(nextColumns);
      } else {
        const nextColumns = tableColumns.map((previousColumn) =>
          previousColumn.fieldMetadataId === viewField.fieldMetadataId
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
        (visibleColumn) =>
          visibleColumn.fieldMetadataId === column.fieldMetadataId,
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
