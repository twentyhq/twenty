import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewSortsScopedFamilyState } from '../states/currentViewSortsScopedFamilyState';
import { getViewScopedStatesFromSnapshot } from '../utils/getViewScopedStatesFromSnapshot';
import { getViewScopedStateValuesFromSnapshot } from '../utils/getViewScopedStateValuesFromSnapshot';

import { useViewFields } from './internal/useViewFields';
import { useViewFilters } from './internal/useViewFilters';
import { useViews } from './internal/useViews';
import { useViewScopedStates } from './internal/useViewScopedStates';
import { useViewSorts } from './internal/useViewSorts';

type UseViewProps = {
  viewScopeId?: string;
};

export const useView = (props?: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    props?.viewScopeId,
  );

  const {
    currentViewFiltersState,
    currentViewIdState,
    currentViewSortsState,
    viewEditModeState,
    availableFieldDefinitionsState,
    availableFilterDefinitionsState,
    availableSortDefinitionsState,
    entityCountInCurrentViewState,
    viewObjectMetadataIdState,
    viewTypeState,
  } = useViewScopedStates({
    customViewScopeId: scopeId,
  });

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

  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);

  const setAvailableFieldDefinitions = useSetRecoilState(
    availableFieldDefinitionsState,
  );

  const setAvailableSortDefinitions = useSetRecoilState(
    availableSortDefinitionsState,
  );

  const setAvailableFilterDefinitions = useSetRecoilState(
    availableFilterDefinitionsState,
  );

  const setEntityCountInCurrentView = useSetRecoilState(
    entityCountInCurrentViewState,
  );

  const setViewEditMode = useSetRecoilState(viewEditModeState);
  const setViewObjectMetadataId = useSetRecoilState(viewObjectMetadataIdState);
  const setViewType = useSetRecoilState(viewTypeState);

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
    ({ snapshot, set }) =>
      () => {
        const {
          savedViewFilters,
          savedViewSorts,
          onViewFiltersChange,
          onViewSortsChange,
        } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId: scopeId,
        });

        if (savedViewFilters) {
          set(currentViewFiltersState, savedViewFilters);
          onViewFiltersChange?.(savedViewFilters);
        }
        if (savedViewSorts) {
          set(currentViewSortsState, savedViewSorts);
          onViewSortsChange?.(savedViewSorts);
        }

        set(viewEditModeState, 'none');
      },
    [
      currentViewFiltersState,
      currentViewSortsState,
      scopeId,
      viewEditModeState,
    ],
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
      async (viewIdToDelete: string) => {
        const { currentViewId } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId: scopeId,
        });

        const { currentViewIdState, viewsState } =
          getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
          });

        if (currentViewId === viewIdToDelete) {
          set(currentViewIdState, undefined);
        }

        set(viewsState, (previousViews) =>
          previousViews.filter((view) => view.id !== viewIdToDelete),
        );

        internalDeleteView(viewIdToDelete);

        if (currentViewId === viewIdToDelete) {
          setSearchParams();
        }
      },
    [internalDeleteView, scopeId, setSearchParams],
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
    resetViewBar,
    handleViewNameSubmit,

    setViewEditMode,
    setViewObjectMetadataId,
    setViewType,
    setEntityCountInCurrentView,
    setAvailableFieldDefinitions,

    setAvailableSortDefinitions,
    upsertViewSort,
    removeViewSort,

    setAvailableFilterDefinitions,
    upsertViewFilter,
    removeViewFilter,

    persistViewFields,
    changeViewInUrl,
    loadView,
  };
};
