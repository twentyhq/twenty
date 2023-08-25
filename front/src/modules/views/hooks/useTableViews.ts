import { useCallback } from 'react';

import type {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { sortsScopedState } from '@/ui/filter-n-sort/states/sortsScopedState';
import type { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import type { SortType } from '@/ui/filter-n-sort/types/interface';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/table/states/tableColumnsScopedState';
import { currentTableViewIdState } from '@/ui/table/states/tableViewsState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useTableViewFields } from './useTableViewFields';
import { useViewFilters } from './useViewFilters';
import { useViews } from './useViews';
import { useViewSorts } from './useViewSorts';

export const useTableViews = <Entity, SortField>({
  availableFilters,
  availableSorts,
  objectId,
  viewFieldDefinitions,
}: {
  availableFilters: FilterDefinitionByEntity<Entity>[];
  availableSorts: SortType<SortField>[];
  objectId: 'company' | 'person';
  viewFieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
}) => {
  const currentViewId = useRecoilScopedValue(
    currentTableViewIdState,
    TableRecoilScopeContext,
  );
  const currentColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const selectedFilters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );
  const selectedSorts = useRecoilScopedValue(
    sortsScopedState,
    TableRecoilScopeContext,
  );

  const { createViewFields, persistColumns } = useTableViewFields({
    objectName: objectId,
    viewFieldDefinitions,
  });
  const { createViewFilters, persistFilters } = useViewFilters({
    availableFilters,
    currentViewId,
    scopeContext: TableRecoilScopeContext,
  });
  const { createViewSorts, persistSorts } = useViewSorts({
    availableSorts,
    currentViewId,
    scopeContext: TableRecoilScopeContext,
  });

  const handleViewCreate = useCallback(
    async (viewId: string) => {
      await createViewFields(currentColumns, viewId);
      await createViewFilters(selectedFilters, viewId);
      await createViewSorts(selectedSorts, viewId);
    },
    [
      createViewFields,
      createViewFilters,
      createViewSorts,
      currentColumns,
      selectedFilters,
      selectedSorts,
    ],
  );

  const handleViewSubmit = useCallback(async () => {
    await persistColumns();
    await persistFilters();
    await persistSorts();
  }, [persistColumns, persistFilters, persistSorts]);

  const { handleViewsChange } = useViews({
    objectId,
    onViewCreate: handleViewCreate,
  });

  return { handleViewsChange, handleViewSubmit };
};
