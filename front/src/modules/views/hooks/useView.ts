import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { currentViewSortsScopedFamilyState } from '../states/currentViewSortsScopedFamilyState';
import { viewsScopedState } from '../states/viewsScopedState';
import { getViewScopedStateValuesFromSnapshot } from '../utils/getViewScopedStateValuesFromSnapshot';

import { useViewFields } from './internal/useViewFields';
import { useViewFilters } from './internal/useViewFilters';
import { useViews } from './internal/useViews';
import { useViewSorts } from './internal/useViewSorts';
import { useViewScopedStates } from './useViewScopedStates';
import { useViewSetStates } from './useViewSetStates';

type UseViewProps = {
  viewScopeId?: string;
};

export const useView = (props?: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    props?.viewScopeId,
  );

  const {
    setViews,
    setViewEditMode,
    setViewObjectId,
    setViewType,
    setEntityCountInCurrentView,
    setIsViewBarExpanded,

    setAvailableSortDefinitions,
    setCurrentViewSorts,
    setSavedViewSorts,

    setAvailableFilterDefinitions,
    setCurrentViewFilters,
    setSavedViewFilters,

    setAvailableFieldDefinitions,
    setCurrentViewFields,
    setSavedViewFields,

    setOnViewFieldsChange,
    setOnViewFiltersChange,
    setOnViewSortsChange,
  } = useViewSetStates(scopeId);

  const { persistViewSorts, upsertViewSort, removeViewSort } =
    useViewSorts(scopeId);
  const { persistViewFilters, upsertViewFilter, removeViewFilter } =
    useViewFilters(scopeId);
  const { persistViewFields } = useViewFields(scopeId);
  const {
    createView: internalCreateView,
    updateView: internalUpdateView,
    deleteView: internalDeleteView,
  } = useViews(scopeId);

  const { currentViewIdState } = useViewScopedStates({
    customViewScopeId: scopeId,
  });

  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);

  const [_, setSearchParams] = useSearchParams();

  const changeViewInUrl = useCallback(
    (viewId: string) => {
      setSearchParams({ view: viewId });
    },
    [setSearchParams],
  );

  const loadView = useRecoilCallback(
    ({ snapshot }) =>
      (viewId: string) => {
        setCurrentViewId?.(viewId);

        const {
          currentViewFields,
          onViewFieldsChange,
          currentViewFilters,
          onViewFiltersChange,
          currentViewSorts,
          onViewSortsChange,
        } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId: scopeId,
          viewId,
        });

        onViewFieldsChange?.(currentViewFields);
        onViewFiltersChange?.(currentViewFilters);
        onViewSortsChange?.(currentViewSorts);
      },
    [setCurrentViewId, scopeId],
  );

  const resetViewBar = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const { savedViewFilters, savedViewSorts } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
          });

        if (savedViewFilters) {
          setCurrentViewFilters?.(savedViewFilters);
        }
        if (savedViewSorts) {
          setCurrentViewSorts?.(savedViewSorts);
        }

        setViewEditMode?.('none');
      },
    [setCurrentViewFilters, setCurrentViewSorts, setViewEditMode, scopeId],
  );

  const createView = useRecoilCallback(
    ({ snapshot, set }) =>
      async (name: string) => {
        const newViewId = v4();
        await internalCreateView({ id: newViewId, name });

        const { currentViewFields, currentViewFilters, currentViewSorts } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
          });

        set(
          currentViewFieldsScopedFamilyState({ scopeId, familyKey: newViewId }),
          currentViewFields,
        );

        set(
          currentViewFiltersScopedFamilyState({
            scopeId,
            familyKey: newViewId,
          }),
          currentViewFilters,
        );

        set(
          currentViewSortsScopedFamilyState({
            scopeId,
            familyKey: newViewId,
          }),
          currentViewSorts,
        );

        await persistViewFields(currentViewFields, newViewId);
        await persistViewFilters(newViewId);
        await persistViewSorts(newViewId);

        changeViewInUrl(newViewId);
      },
    [
      changeViewInUrl,
      internalCreateView,
      persistViewFields,
      persistViewFilters,
      persistViewSorts,
      scopeId,
    ],
  );

  const updateCurrentView = async () => {
    await persistViewFilters();
    await persistViewSorts();
  };

  const removeView = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const { currentViewId } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId: scopeId,
          viewId,
        });

        if (currentViewId === viewId) {
          set(currentViewIdScopedState({ scopeId }), undefined);
        }

        set(viewsScopedState({ scopeId }), (previousViews) =>
          previousViews.filter((view) => view.id !== viewId),
        );

        internalDeleteView(viewId);
      },
    [internalDeleteView, scopeId],
  );

  const handleViewNameSubmit = useRecoilCallback(
    ({ snapshot }) =>
      async (name?: string) => {
        if (!name) {
          return;
        }

        const { viewEditMode, currentView } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
          });

        if (!currentView) {
          return;
        }

        if (viewEditMode === 'create' && name) {
          await createView(name);
        } else {
          await internalUpdateView({
            ...currentView,
            name,
          });
        }
      },
    [createView, internalUpdateView, scopeId],
  );

  return {
    scopeId,
    currentViewId,

    setCurrentViewId,
    updateCurrentView,
    createView,
    removeView,
    setIsViewBarExpanded,
    resetViewBar,
    handleViewNameSubmit,

    setViews,
    setViewEditMode,
    setViewObjectId,
    setViewType,
    setEntityCountInCurrentView,

    setAvailableSortDefinitions,
    setCurrentViewSorts,
    setSavedViewSorts,
    upsertViewSort,
    removeViewSort,

    setAvailableFilterDefinitions,
    setCurrentViewFilters,
    setSavedViewFilters,
    upsertViewFilter,
    removeViewFilter,

    setAvailableFieldDefinitions,
    setCurrentViewFields,
    setSavedViewFields,

    persistViewFields,
    changeViewInUrl,
    loadView,

    setOnViewFieldsChange,
    setOnViewFiltersChange,
    setOnViewSortsChange,
  };
};
