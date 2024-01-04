import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { FieldMetadata } from '@/object-record/field/types/FieldMetadata';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { ColumnDefinition } from '../types/ColumnDefinition';

import { useRecordTableScopedStates } from './internal/useRecordTableScopedStates';

type useRecordTableProps = {
  recordTableScopeId?: string;
};

export const useTableColumns = (props?: useRecordTableProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    props?.recordTableScopeId,
  );
  const { onColumnsChange, setTableColumns } = useRecordTable({
    recordTableScopeId: scopeId,
  });

  const {
    injectStateWithRecordTableScopeId,
    injectSelectorWithRecordTableScopeId,
  } = useRecordTableScopedStates(scopeId);

  const {
    availableTableColumnsScopeInjector,
    tableColumnsScopeInjector,
    visibleTableColumnsScopeInjector,
  } = getRecordTableScopeInjector();

  const availableTableColumnsState = injectStateWithRecordTableScopeId(
    availableTableColumnsScopeInjector,
  );

  const tableColumnsState = injectStateWithRecordTableScopeId(
    tableColumnsScopeInjector,
  );

  const visibleTableColumnsSelector = injectSelectorWithRecordTableScopeId(
    visibleTableColumnsScopeInjector,
  );

  const availableTableColumns = useRecoilValue(availableTableColumnsState);

  const tableColumns = useRecoilValue(tableColumnsState);
  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector);

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
