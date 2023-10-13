import { useSearchParams } from 'react-router-dom';

import { TableRecoilScopeContext } from '@/ui/Data/Data Table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/Data/Data Table/states/tableColumnsScopedState';
import { ColumnDefinition } from '@/ui/Data/Data Table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/Data/Field/types/FieldMetadata';
import { filtersScopedState } from '@/ui/Data/View Bar/states/filtersScopedState';
import { sortsScopedState } from '@/ui/Data/View Bar/states/sortsScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
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
  columnDefinitions: ColumnDefinition<FieldMetadata>[];
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

  const [_, setSearchParams] = useSearchParams();

  const handleViewCreate = async (viewId: string) => {
    await createViewFields(tableColumns, viewId);
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
    setSearchParams({ view: viewId });
  };

  const { createView, deleteView, isFetchingViews, updateView } = useViews({
    objectId,
    onViewCreate: handleViewCreate,
    type: ViewType.Table,
    RecoilScopeContext: TableRecoilScopeContext,
  });
  const { createViewFields, persistColumns } = useTableViewFields({
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
    await persistFilters();
    await persistSorts();
  };

  return {
    createView,
    deleteView,
    persistColumns,
    submitCurrentView,
    updateView,
  };
};
