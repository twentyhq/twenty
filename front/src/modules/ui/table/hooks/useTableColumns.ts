import { useCallback, useContext } from 'react';
import { useSetRecoilState } from 'recoil';

import { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';
import { useMoveViewColumns } from '@/views/hooks/useMoveViewColumns';

import { TableContext } from '../contexts/TableContext';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { savedTableColumnsFamilyState } from '../states/savedTableColumnsFamilyState';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
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
  const tableColumnsByKey = useRecoilScopedValue(
    tableColumnsByKeyScopedSelector,
    TableRecoilScopeContext,
  );

  const { handleColumnMove } = useMoveViewColumns();

  const handleColumnsChange = useCallback(
    async (columns: ColumnDefinition<ViewFieldMetadata>[]) => {
      setSavedTableColumns(columns);
      setTableColumns(columns);

      await onColumnsChange?.(columns);
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

  const handleMoveTableColumn = useCallback(
    (
      direction: 'left' | 'right',
      column: ColumnDefinition<ViewFieldMetadata>,
    ) => {
      const currentColumnArrayIndex = tableColumns.findIndex(
        (tableColumn) => tableColumn.key === column.key,
      );
      const columns = handleColumnMove(
        direction,
        currentColumnArrayIndex,
        tableColumns,
      );

      setTableColumns(columns);
    },
    [tableColumns, setTableColumns, handleColumnMove],
  );

  return {
    handleColumnVisibilityChange,
    handleMoveTableColumn,
    handleColumnReorder,
    handleColumnsChange,
  };
};
