import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { viewsScopedState } from '../states/viewsScopedState';

import { useViewFields } from './internal/useViewFields';
import { useViewFilters } from './internal/useViewFilters';
import { useViews } from './internal/useViews';
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
    currentView,

    views,
    setViews,
    viewEditMode,
    setViewEditMode,
    viewObjectId,
    setViewObjectId,
    viewType,
    setViewType,
    entityCountInCurrentView,
    setEntityCountInCurrentView,
    isViewBarExpanded,
    setIsViewBarExpanded,

    availableSorts,
    setAvailableSorts,
    currentViewSorts,
    setCurrentViewSorts,
    savedViewSorts,
    savedViewSortsByKey,
    setSavedViewSorts,
    canPersistSorts,
    currentViewSortsOrderBy,

    availableFilters,
    setAvailableFilters,
    currentViewFilters,
    setCurrentViewFilters,
    savedViewFilters,
    savedViewFiltersByKey,
    setSavedViewFilters,
    canPersistFilters,

    availableFields,
    setAvailableFields,
    currentViewFields,
    currentViewFieldsByKey,
    setCurrentViewFields,

    onViewSortsChange,
    setOnViewSortsChange,
    onViewFiltersChange,
    setOnViewFiltersChange,
    onViewFieldsChange,
    setOnViewFieldsChange,
  } = useViewStates(scopeId);

  const { persistViewSorts } = useViewSorts(scopeId);
  const { persistViewFilters } = useViewFilters(scopeId);
  const { persistViewFields } = useViewFields(scopeId);
  const { createView: internalCreateView, deleteView: internalDeleteView } =
    useViews(scopeId);

  const [_, setSearchParams] = useSearchParams();

  const resetViewBar = () => {
    if (savedViewFilters) {
      setCurrentViewFilters?.(savedViewFilters);
    }
    if (savedViewSorts) {
      setCurrentViewSorts?.(savedViewSorts);
    }
    setViewEditMode?.('none');
    setIsViewBarExpanded?.(false);
  };

  const createView = async (name: string) => {
    if (!currentViewSorts || !currentViewFilters || !currentViewFields) {
      return;
    }

    const newViewId = v4();
    await internalCreateView({ id: v4(), name });

    await persistViewFields(currentViewFields, newViewId);
    await persistViewFilters();
    await persistViewSorts();
    setCurrentViewId(newViewId);

    setSearchParams({ view: newViewId });
  };

  const updateCurrentView = async () => {
    await persistViewFilters();
    await persistViewSorts();
  };

  const removeView = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const currentViewId = await snapshot.getPromise(
          currentViewIdScopedState({ scopeId }),
        );

        if (currentViewId === viewId)
          set(currentViewIdScopedState({ scopeId }), undefined);

        set(viewsScopedState({ scopeId }), (previousViews) =>
          previousViews.filter((view) => view.id !== viewId),
        );
        internalDeleteView(viewId);
      },
    [internalDeleteView, scopeId],
  );

  return {
    scopeId,
    currentViewId,
    currentView,
    setCurrentViewId,
    updateCurrentView,
    createView,
    removeView,
    isViewBarExpanded,
    setIsViewBarExpanded,
    resetViewBar,

    views,
    setViews,
    viewEditMode,
    setViewEditMode,
    viewObjectId,
    setViewObjectId,
    viewType,
    setViewType,
    entityCountInCurrentView,
    setEntityCountInCurrentView,
    currentViewSortsOrderBy,

    availableSorts,
    setAvailableSorts,
    currentViewSorts,
    setCurrentViewSorts,
    savedViewSorts,
    savedViewSortsByKey,
    setSavedViewSorts,
    canPersistSorts,

    availableFilters,
    setAvailableFilters,
    currentViewFilters,
    setCurrentViewFilters,
    savedViewFilters,
    savedViewFiltersByKey,
    setSavedViewFilters,
    canPersistFilters,

    availableFields,
    setAvailableFields,
    currentViewFields,
    currentViewFieldsByKey,
    setCurrentViewFields,

    onViewSortsChange,
    setOnViewSortsChange,
    onViewFiltersChange,
    setOnViewFiltersChange,
    onViewFieldsChange,
    setOnViewFieldsChange,
  };
};
