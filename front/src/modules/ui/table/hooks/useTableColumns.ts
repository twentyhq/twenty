import { useCallback } from 'react';

import { FieldMetadata } from '@/ui/field/types/FieldMetadata';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { ViewFieldDefinition } from '../../../views/types/ViewFieldDefinition';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';

export const useTableColumns = () => {
  const [tableColumns, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const tableColumnsByKey = useRecoilScopedValue(
    tableColumnsByKeyScopedSelector,
    TableRecoilScopeContext,
  );

  const handleColumnReorder = useCallback(
    (columns: ViewFieldDefinition<FieldMetadata>[]) => {
      const updatedColumnOrder = columns
        .map((column, index) => {
          return { ...column, index };
        })
        .sort((columnA, columnB) => columnA.index - columnB.index);

      setTableColumns(updatedColumnOrder);
    },
    [setTableColumns],
  );

  const handleColumnVisibilityChange = useCallback(
    (column: ViewFieldDefinition<FieldMetadata>) => {
      const nextColumns = tableColumnsByKey[column.key]
        ? tableColumns.map((previousColumn) =>
            previousColumn.key === column.key
              ? { ...previousColumn, isVisible: !column.isVisible }
              : previousColumn,
          )
        : [...tableColumns, { ...column, isVisible: true }].sort(
            (columnA, columnB) => columnA.index - columnB.index,
          );

      setTableColumns(nextColumns);
    },
    [tableColumnsByKey, tableColumns, setTableColumns],
  );

  const handleColumnMove = useCallback(
    (direction: string, column: ViewFieldDefinition<FieldMetadata>) => {
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

        setTableColumns(newTableColumns);
      }
    },
    [tableColumns, setTableColumns],
  );

  const handleColumnLeftMove = useCallback(
    (column: ViewFieldDefinition<FieldMetadata>) => {
      handleColumnMove('left', column);
    },
    [handleColumnMove],
  );

  const handleColumnRightMove = useCallback(
    (column: ViewFieldDefinition<FieldMetadata>) => {
      handleColumnMove('right', column);
    },
    [handleColumnMove],
  );

  return {
    handleColumnVisibilityChange,
    handleColumnLeftMove,
    handleColumnRightMove,
    handleColumnReorder,
  };
};
