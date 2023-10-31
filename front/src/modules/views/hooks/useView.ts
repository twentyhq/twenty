import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { currentViewSortsScopedFamilyState } from '../states/currentViewSortsScopedFamilyState';
import { onViewFieldsChangeScopedState } from '../states/onViewFieldsChangeScopedState';
import { onViewFiltersChangeScopedState } from '../states/onViewFiltersChangeScopedState';
import { onViewSortsChangeScopedState } from '../states/onViewSortsChangeScopedState';
import { savedViewFiltersScopedFamilyState } from '../states/savedViewFiltersScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../states/savedViewSortsScopedFamilyState';
import { currentViewScopedSelector } from '../states/selectors/currentViewScopedSelector';
import { viewEditModeScopedState } from '../states/viewEditModeScopedState';
import { viewsScopedState } from '../states/viewsScopedState';

import { useViewFields } from './internal/useViewFields';
import { useViewFilters } from './internal/useViewFilters';
import { useViews } from './internal/useViews';
import { useViewSorts } from './internal/useViewSorts';
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
    setCurrentViewId,
    currentViewId,

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
  const [_, setSearchParams] = useSearchParams();

  const changeViewInUrl = useCallback(
    (viewId: string) => {
      setSearchParams({ view: viewId });
    },
    [setSearchParams],
  );

  const loadView = useRecoilCallback(({ snapshot }) => (viewId: string) => {
    setCurrentViewId?.(viewId);
    const currentViewFields = snapshot
      .getLoadable(
        currentViewFieldsScopedFamilyState({ scopeId, familyKey: viewId }),
      )
      .getValue();

    const onViewFieldsChange = snapshot
      .getLoadable(onViewFieldsChangeScopedState({ scopeId }))
      .getValue();

    onViewFieldsChange?.(currentViewFields);

    const currentViewFilters = snapshot
      .getLoadable(
        currentViewFiltersScopedFamilyState({ scopeId, familyKey: viewId }),
      )
      .getValue();

    const onViewFiltersChange = snapshot
      .getLoadable(onViewFiltersChangeScopedState({ scopeId }))
      .getValue();

    onViewFiltersChange?.(currentViewFilters);

    const currentViewSorts = snapshot
      .getLoadable(
        currentViewSortsScopedFamilyState({ scopeId, familyKey: viewId }),
      )
      .getValue();

    const onViewSortsChange = snapshot
      .getLoadable(onViewSortsChangeScopedState({ scopeId }))
      .getValue();

    onViewSortsChange?.(currentViewSorts);
  });

  const resetViewBar = useRecoilCallback(({ snapshot }) => () => {
    const savedViewFilters = snapshot
      .getLoadable(
        savedViewFiltersScopedFamilyState({
          scopeId,
          familyKey: currentViewId || '',
        }),
      )
      .getValue();

    const savedViewSorts = snapshot
      .getLoadable(
        savedViewSortsScopedFamilyState({
          scopeId,
          familyKey: currentViewId || '',
        }),
      )
      .getValue();

    if (savedViewFilters) {
      setCurrentViewFilters?.(savedViewFilters);
    }
    if (savedViewSorts) {
      setCurrentViewSorts?.(savedViewSorts);
    }
    setViewEditMode?.('none');
  });

  const createView = useRecoilCallback(
    ({ snapshot, set }) =>
      async (name: string) => {
        const newViewId = v4();
        await internalCreateView({ id: newViewId, name });

        const currentViewFields = snapshot
          .getLoadable(
            currentViewFieldsScopedFamilyState({
              scopeId,
              familyKey: currentViewId || '',
            }),
          )
          .getValue();

        set(
          currentViewFieldsScopedFamilyState({ scopeId, familyKey: newViewId }),
          currentViewFields,
        );

        const currentViewFilters = snapshot
          .getLoadable(
            currentViewFiltersScopedFamilyState({
              scopeId,
              familyKey: currentViewId || '',
            }),
          )
          .getValue();

        set(
          currentViewFiltersScopedFamilyState({
            scopeId,
            familyKey: newViewId,
          }),
          currentViewFilters,
        );

        const currentViewSorts = snapshot
          .getLoadable(
            currentViewSortsScopedFamilyState({
              scopeId,
              familyKey: currentViewId || '',
            }),
          )
          .getValue();

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
      currentViewId,
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

  const handleViewNameSubmit = useRecoilCallback(
    ({ snapshot }) =>
      async (name?: string) => {
        if (!name) {
          return;
        }

        const viewEditMode = snapshot
          .getLoadable(viewEditModeScopedState({ scopeId }))
          .getValue();

        const currentView = snapshot
          .getLoadable(currentViewScopedSelector(scopeId))
          .getValue();

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
