import { useSearchParams } from 'react-router-dom';

import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { filtersScopedState } from '@/ui/data/view-bar/states/filtersScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';

import { useTableViewFields } from './useViewFieldsInternal';
import { useViewFilters } from './useViewFilters';
import { useViewSortsInternal } from './useViewSortsInternal';
import { useViewStates } from './useViewStates';

type UseViewProps = {
  viewScopeId?: string;
};

export const useView = ({ viewScopeId }: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewScopeId,
  );

  const { currentViewId, setCurrentViewId, sorts } = useViewStates(scopeId);

  const { createViewSorts, persistSorts } = useViewSortsInternal(scopeId);
  const { createViewFilters, persistFilters } = useViewFilters({
    viewScopeId: viewScopeId,
    RecoilScopeContext: TableRecoilScopeContext,
  });

  const tableColumns = useRecoilScopedValue(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const filters = useRecoilScopedValue(
    filtersScopedState,
    TableRecoilScopeContext,
  );

  const [_, setSearchParams] = useSearchParams();

  const handleViewCreate = async (viewId: string) => {
    if (!sorts) {
      return;
    }

    await createViewFields(tableColumns, viewId);
    await createViewFilters(filters, viewId);
    await createViewSorts(sorts, viewId);
    setSearchParams({ view: viewId });
  };

  const { createViewFields, persistColumns } = useTableViewFields({
    viewScopeId: viewScopeId,
    objectId,
    columnDefinitions,
    skipFetch: isFetchingViews,
  });

  const createDefaultViewFields = async () => {
    await createViewFields(tableColumns);
  };

  const submitCurrentView = async () => {
    await persistFilters();
    await persistSorts();
  };

  return {
    scopeId,
    currentViewId,
    setCurrentViewId,
    createViewSorts,
    persistSorts,
    submitCurrentView,
    handleViewCreate,

    persistColumns,

    createDefaultViewFields,
  };
};
