import { useCallback } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { useSetTableColumns } from '@/object-record/record-table/hooks/useSetTableColumns';
import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ColumnDefinition } from '../types/ColumnDefinition';

type useRecordTableProps = {
  recordTableId?: string;
  objectMetadataId: string;
};

export const useTableColumns = (props: useRecordTableProps) => {
  const { onColumnsChange } = useRecordTable({
    recordTableId: props?.recordTableId,
  });

  const { setTableColumns } = useSetTableColumns();

  const availableTableColumns = useRecoilComponentValue(
    availableTableColumnsComponentState,
    props?.recordTableId,
  );

  const tableColumns = useRecoilComponentValue(
    tableColumnsComponentState,
    props?.recordTableId,
  );
  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
    props?.recordTableId,
  );

  const { handleColumnMove } = useMoveViewColumns();

  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(
    props?.recordTableId,
  );

  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    props?.recordTableId,
  );

  const handleColumnsChange = useCallback(
    async (columns: ColumnDefinition<FieldMetadata>[]) => {
      setTableColumns(columns, instanceId, props.objectMetadataId);

      await onColumnsChange?.(columns);
    },
    [setTableColumns, instanceId, onColumnsChange, props.objectMetadataId],
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

      await handleColumnsChange(columns);
    },
    [
      unfocusRecordTableCell,
      visibleTableColumns,
      handleColumnMove,
      handleColumnsChange,
    ],
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
