import { useCallback } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ColumnDefinition } from '../types/ColumnDefinition';

type useRecordTableProps = {
  recordTableId?: string;
};

export const useTableColumns = (props?: useRecordTableProps) => {
  const { onColumnsChange, setTableColumns } = useRecordTable({
    recordTableId: props?.recordTableId,
  });

  const availableTableColumns = useRecoilComponentValueV2(
    availableTableColumnsComponentState,
    props?.recordTableId,
  );

  const tableColumns = useRecoilComponentValueV2(
    tableColumnsComponentState,
    props?.recordTableId,
  );
  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
    props?.recordTableId,
  );

  const { handleColumnMove } = useMoveViewColumns();

  const handleColumnsChange = useCallback(
    async (columns: ColumnDefinition<FieldMetadata>[]) => {
      setTableColumns(columns);

      await onColumnsChange?.(columns);
    },
    [onColumnsChange, setTableColumns],
  );

  const handleColumnVisibilityChange = useCallback(
    async (
      viewField: Omit<ColumnDefinition<FieldMetadata>, 'size' | 'position'>,
    ) => {
      const shouldShowColumn = !visibleTableColumns.some(
        (visibleColumn) =>
          visibleColumn.fieldMetadataId === viewField.fieldMetadataId,
      );

      const tableColumnPositions = [...tableColumns]
        .sort((a, b) => b.position - a.position)
        .map((column) => column.position);

      const lastPosition = tableColumnPositions[0] ?? 0;

      if (shouldShowColumn) {
        const newColumn = availableTableColumns.find(
          (availableTableColumn) =>
            availableTableColumn.fieldMetadataId === viewField.fieldMetadataId,
        );

        if (!newColumn) return;

        const nextColumns = [
          ...tableColumns,
          { ...newColumn, isVisible: true, position: lastPosition + 1 },
        ];

        await handleColumnsChange(nextColumns);
      } else {
        const nextColumns = visibleTableColumns.map((previousColumn) =>
          previousColumn.fieldMetadataId === viewField.fieldMetadataId
            ? { ...previousColumn, isVisible: !viewField.isVisible }
            : previousColumn,
        );

        await handleColumnsChange(nextColumns);
      }
    },
    [
      tableColumns,
      availableTableColumns,
      handleColumnsChange,
      visibleTableColumns,
    ],
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
