import { useCallback } from 'react';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsByIdScopedSelector } from '../states/selectors/tableColumnsByIdScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';
import type { ColumnDefinition } from '../types/ColumnDefinition';

export const useTableColumns = () => {
  const [tableColumns, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const tableColumnsById = useRecoilScopedValue(
    tableColumnsByIdScopedSelector,
    TableRecoilScopeContext,
  );

  const handleColumnVisibilityChange = useCallback(
    (column: ColumnDefinition<ViewFieldMetadata>) => {
      const nextColumns = tableColumnsById[column.id]
        ? tableColumns.map((previousColumn) =>
            previousColumn.id === column.id
              ? { ...previousColumn, isVisible: !column.isVisible }
              : previousColumn,
          )
        : [...tableColumns, { ...column, isVisible: true }].sort(
            (columnA, columnB) => columnA.order - columnB.order,
          );

      setTableColumns(nextColumns);
    },
    [setTableColumns, tableColumns, tableColumnsById],
  );

  return { handleColumnVisibilityChange };
};
