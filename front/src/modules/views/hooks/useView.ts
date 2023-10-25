import { useSearchParams } from 'react-router-dom';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';

import { useViewFields } from './internal/useViewFields';
import { useViewFilters } from './internal/useViewFilters';
import { useViewSorts } from './internal/useViewSorts';
import { useViewStates } from './useViewStates';

type UseViewProps = {
  viewScopeId?: string;
};

export const useView = (props?: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    props?.viewScopeId,
  );

  const {
    currentViewId,
    setCurrentViewId,
    currentViewSorts,
    currentViewFields,
    currentViewFilters,
    viewEditMode,
    setViewEditMode,
    setAvailableViewSorts,
    setAvailableViewFilters,
    setAvailableViewFields,
    setViewType,
    setViewObjectId,
  } = useViewStates(scopeId);

  const { persistViewSorts } = useViewSorts(scopeId);
  const { persistViewFilters } = useViewFilters(scopeId);
  const { persistViewFields } = useViewFields(scopeId);

  const [_, setSearchParams] = useSearchParams();

  const createView = async (viewId: string) => {
    if (!currentViewSorts || !currentViewFilters || !currentViewFields) {
      return;
    }

    await persistViewFields(currentViewFields, viewId);
    await persistViewFilters();
    await persistViewSorts();

    setSearchParams({ view: viewId });
  };

  const submitCurrentView = async () => {
    await persistViewFilters();
    await persistViewSorts();
  };

  return {
    scopeId,
    currentViewId,
    setCurrentViewId,
    submitCurrentView,
    createView,
    setAvailableViewSorts,
    setAvailableViewFilters,
    setAvailableViewFields,
    setViewObjectId,
    setViewType,
    viewEditMode,
    setViewEditMode,
  };
};
