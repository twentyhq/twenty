import { useSearchParams } from 'react-router-dom';

import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { useSort } from '@/ui/data/sort/hooks/useSort';
import { filtersScopedState } from '@/ui/data/view-bar/states/filtersScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useTableViewFields } from '@/views/hooks/useTableViewFields';
import { useViewFilters } from '@/views/hooks/useViewFilters';
import { useViews } from '@/views/hooks/useViews';
import { useViewSorts } from '@/views/hooks/useViewSorts';
import { ViewType } from '~/generated/graphql';

import { useMetadataObjectInContext } from './useMetadataObjectInContext';

export const useMetadataTableViews = () => {
  const { objectNamePlural, columnDefinitions } = useMetadataObjectInContext();

  const tableColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const filters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );

  const objectId = objectNamePlural;

  const tableViewScopeId = objectNamePlural;
  const sortScopeId = objectNamePlural + '-sort';

  const { sorts } = useSort({
    sortScopeId: sortScopeId,
  });

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
    viewScopeId: tableViewScopeId,
    objectId,
    columnDefinitions,
    skipFetch: isFetchingViews,
  });

  const createDefaultViewFields = async () => {
    await createViewFields(tableColumns);
  };

  const { createViewFilters, persistFilters } = useViewFilters({
    RecoilScopeContext: TableRecoilScopeContext,
    skipFetch: isFetchingViews,
  });

  const { createViewSorts, persistSorts } = useViewSorts({
    viewScopeId: tableViewScopeId,
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
    createDefaultViewFields,
    isFetchingViews,
  };
};
