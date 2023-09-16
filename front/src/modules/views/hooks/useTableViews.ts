import type { ViewFieldMetadata } from '@/ui/editable-field/types/ViewField';
import { TableRecoilScopeContext } from '@/ui/table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/table/states/tableColumnsScopedState';
import type { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { sortsScopedState } from '@/ui/view-bar/states/sortsScopedState';
import { ViewType } from '~/generated/graphql';

import { useTableViewFields } from './useTableViewFields';
import { useViewFilters } from './useViewFilters';
import { useViews } from './useViews';
import { useViewSorts } from './useViewSorts';

export const useTableViews = ({
  objectId,
  columnDefinitions,
}: {
  objectId: 'company' | 'person';
  columnDefinitions: ColumnDefinition<ViewFieldMetadata>[];
}) => {
  const tableColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const filters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );
  const sorts = useRecoilScopedValue(sortsScopedState, TableRecoilScopeContext);

  const handleViewCreate = async (viewId: string) => {
    await createViewFields(tableColumns, viewId);
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
  };

  const { createView, deleteView, isFetchingViews, updateView } = useViews({
    objectId,
    onViewCreate: handleViewCreate,
    type: ViewType.Table,
    RecoilScopeContext: TableRecoilScopeContext,
  });
  const { createViewFields, persistColumns, updateViewFields } =
    useTableViewFields({
      objectId,
      columnDefinitions,
      skipFetch: isFetchingViews,
    });
    
  const { createViewFilters, persistFilters } = useViewFilters({
    RecoilScopeContext: TableRecoilScopeContext,
    skipFetch: isFetchingViews,
  });

  const { createViewSorts, persistSorts } = useViewSorts({
    RecoilScopeContext: TableRecoilScopeContext,
    skipFetch: isFetchingViews,
  });

  const submitCurrentView = async () => {
    await persistColumns();
    await persistFilters();
    await persistSorts();
    await updateViewFields(tableColumns);
  };

  return { createView, deleteView, submitCurrentView, updateView };
};
