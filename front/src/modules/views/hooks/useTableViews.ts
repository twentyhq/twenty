import { useCallback } from 'react';

import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import type { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import type { SortType } from '@/ui/filter-n-sort/types/interface';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/table/states/tableColumnsScopedState';
import { currentTableViewIdState } from '@/ui/table/states/tableViewsState';
import type { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewType } from '~/generated/graphql';

import { useTableViewFields } from './useTableViewFields';
import { useViewFilters } from './useViewFilters';
import { useViews } from './useViews';
import { useViewSorts } from './useViewSorts';

export const useTableViews = <Entity, SortField>({
  availableFilters,
  availableSorts,
  objectId,
  columnDefinitions,
}: {
  availableFilters: FilterDefinitionByEntity<Entity>[];
  availableSorts: SortType<SortField>[];
  objectId: 'company' | 'person';
  columnDefinitions: ColumnDefinition<ViewFieldMetadata>[];
}) => {
  const currentTableViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const tableColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const filters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );
  const sorts = useRecoilScopedValue(sortsScopedState, TableRecoilScopeContext);

  const { handleViewsChange, isFetchingViews } = useViews({
    objectId,
    onViewCreate: handleViewCreate,
    type: ViewType.Table,
  });
  const { createViewFields, persistColumns } = useTableViewFields({
    objectId,
    columnDefinitions,
    skipFetch: isFetchingViews,
  });
  const { createViewFilters, persistFilters } = useViewFilters({
    availableFilters,
    currentViewId: currentTableViewId,
    scopeContext: TableRecoilScopeContext,
    skipFetch: isFetchingViews,
  });
  const { createViewSorts, persistSorts } = useViewSorts({
    availableSorts,
    currentViewId: currentTableViewId,
    scopeContext: TableRecoilScopeContext,
    skipFetch: isFetchingViews,
  });

  async function handleViewCreate(viewId: string) {
    await createViewFields(tableColumns, viewId);
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
  }

  const handleViewSubmit = useCallback(async () => {
    await persistColumns();
    await persistFilters();
    await persistSorts();
  }, [persistColumns, persistFilters, persistSorts]);

  return { handleViewsChange, handleViewSubmit };
};
