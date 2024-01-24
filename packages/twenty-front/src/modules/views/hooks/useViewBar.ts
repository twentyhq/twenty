import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';
import { assertNotNull } from '~/utils/assert';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
  viewBarId?: string;
};

export const useViewBar = (props?: UseViewProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    props?.viewBarId,
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
  } = useViewScopedStates({
    viewScopeId: scopeId,
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

  const [_, setSearchParams] = useSearchParams();

  const changeViewInUrl = useCallback(
    (viewId: string) => {
      setSearchParams((previousSearchParams) => {
        previousSearchParams.set('view', viewId);
        return previousSearchParams;
      });
    },
    [setSearchParams],
  );

  const loadViewFields = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewFields: ViewField[], currentViewId: string) => {
        const {
          availableFieldDefinitions,
          onViewFieldsChange,
          savedViewFields,
          isPersistingView,
        } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId: scopeId,
          viewId: currentViewId,
        });

        const { savedViewFieldsState, currentViewFieldsState } =
          getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
            viewId: currentViewId,
          });

        if (!availableFieldDefinitions) {
          return;
        }

        const queriedViewFields = viewFields
          .map((viewField) => viewField)
          .filter(assertNotNull);

        if (isPersistingView) {
          return;
        }

        if (!isDeeplyEqual(savedViewFields, queriedViewFields)) {
          set(currentViewFieldsState, queriedViewFields);
          set(savedViewFieldsState, queriedViewFields);
          onViewFieldsChange?.(queriedViewFields);
        }
      },
    [scopeId],
  );

  const loadViewFilters = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewFilters: ViewFilter[], currentViewId: string) => {
        const {
          availableFilterDefinitions,
          savedViewFilters,
          onViewFiltersChange,
        } = getViewScopedStateValuesFromSnapshot({
          snapshot,
          viewScopeId: scopeId,
          viewId: currentViewId,
        });

        const { savedViewFiltersState, currentViewFiltersState } =
          getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
            viewId: currentViewId,
          });

        if (!availableFilterDefinitions) {
          return;
        }

        const queriedViewFilters = viewFilters
          .map((viewFilter) => {
            const availableFilterDefinition = availableFilterDefinitions.find(
              (filterDefinition) =>
                filterDefinition.fieldMetadataId === viewFilter.fieldMetadataId,
            );

            if (!availableFilterDefinition) return null;

            return {
              ...viewFilter,
              displayValue: viewFilter.displayValue ?? viewFilter.value,
              definition: availableFilterDefinition,
            };
          })
          .filter(assertNotNull);

        if (!isDeeplyEqual(savedViewFilters, queriedViewFilters)) {
          set(savedViewFiltersState, queriedViewFilters);
          set(currentViewFiltersState, queriedViewFilters);
        }
        onViewFiltersChange?.(queriedViewFilters);
      },
    [scopeId],
  );

  const loadViewSorts = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewSorts: Required<ViewSort>[], currentViewId: string) => {
        const { availableSortDefinitions, savedViewSorts, onViewSortsChange } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
            viewId: currentViewId,
          });

        const { savedViewSortsState, currentViewSortsState } =
          getViewScopedStatesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
            viewId: currentViewId,
          });

        if (!availableSortDefinitions || !currentViewId) {
          return;
        }

        const queriedViewSorts = viewSorts
          .map((viewSort) => {
            const availableSortDefinition = availableSortDefinitions.find(
              (sort) => sort.fieldMetadataId === viewSort.fieldMetadataId,
            );

            if (!availableSortDefinition) return null;

            return {
              id: viewSort.id,
              fieldMetadataId: viewSort.fieldMetadataId,
              direction: viewSort.direction,
              definition: availableSortDefinition,
            };
          })
          .filter(assertNotNull);

        if (!isDeeplyEqual(savedViewSorts, queriedViewSorts)) {
          set(savedViewSortsState, queriedViewSorts);
          set(currentViewSortsState, queriedViewSorts);
        }
        onViewSortsChange?.(queriedViewSorts);
      },
    [scopeId],
  );

  const loadView = useRecoilCallback(
    ({ snapshot }) =>
      (viewId: string) => {
        setCurrentViewId?.(viewId);

        const { currentView, onViewTypeChange } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
            viewId,
          });

        if (!currentView) {
          return;
        }

        onViewTypeChange?.(currentView.type);
        loadViewFields(currentView.viewFields, viewId);
        loadViewFilters(currentView.viewFilters, viewId);
        loadViewSorts(currentView.viewSorts, viewId);
      },
    [setCurrentViewId, scopeId, loadViewFields, loadViewFilters, loadViewSorts],
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

          // Temporary to force refetch
          await internalUpdateView({
            ...currentView,
          });
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
    loadViewFields,
    loadViewFilters,
    loadViewSorts,
  };
};
