import { useCallback } from 'react';

import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { useHandleColumnsChange } from '@/object-record/record-table/hooks/useHandleColumnsChange';
import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type ColumnDefinition } from '../types/ColumnDefinition';

type useRecordTableProps = {
  recordTableId: string;
  objectMetadataId: string;
};

export const useTableColumns = ({
  objectMetadataId,
  recordTableId,
}: useRecordTableProps) => {
  const availableTableColumns = useRecoilComponentValue(
    availableTableColumnsComponentState,
    recordTableId,
  );

  const tableColumns = useRecoilComponentValue(
    tableColumnsComponentState,
    recordTableId,
  );
  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
    recordTableId,
  );

  const { handleColumnMove } = useMoveViewColumns();

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);

  const { handleColumnsChange } = useHandleColumnsChange();

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

        await handleColumnsChange({
          columns: nextColumns,
          objectMetadataId,
          recordTableId,
        });
      } else {
        const nextColumns = visibleTableColumns.map((previousColumn) =>
          previousColumn.fieldMetadataId === viewField.fieldMetadataId
            ? { ...previousColumn, isVisible: !viewField.isVisible }
            : previousColumn,
        );

        await handleColumnsChange({
          columns: nextColumns,
          objectMetadataId,
          recordTableId,
        });
      }
    },
    [
      tableColumns,
      availableTableColumns,
      handleColumnsChange,
      visibleTableColumns,
      objectMetadataId,
      recordTableId,
    ],
  );

  const handleMoveTableColumn = useCallback(
    async (
      direction: 'left' | 'right',
      column: ColumnDefinition<FieldMetadata>,
    ) => {
      unfocusRecordTableCell();

      const currentColumnArrayIndex = visibleTableColumns.findIndex(
        (visibleColumn) =>
          visibleColumn.fieldMetadataId === column.fieldMetadataId,
      );

      const columns = handleColumnMove(
        direction,
        currentColumnArrayIndex,
        visibleTableColumns,
      );

      await handleColumnsChange({
        columns,
        objectMetadataId,
        recordTableId,
      });
    },
    [
      unfocusRecordTableCell,
      visibleTableColumns,
      handleColumnMove,
      handleColumnsChange,
      objectMetadataId,
      recordTableId,
    ],
  );

  const handleColumnReorder = useCallback(
    async (columns: ColumnDefinition<FieldMetadata>[]) => {
      const updatedColumns = columns.map((column, index) => ({
        ...column,
        position: index,
      }));

      await handleColumnsChange({
        columns: updatedColumns,
        objectMetadataId,
        recordTableId,
      });
    },
    [handleColumnsChange, objectMetadataId, recordTableId],
  );

  return {
    handleColumnVisibilityChange,
    handleMoveTableColumn,
    handleColumnReorder,
    handleColumnsChange,
  };
};
