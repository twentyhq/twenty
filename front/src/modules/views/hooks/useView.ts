import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { savedTableColumnsFamilyState } from '@/ui/data/data-table/states/savedTableColumnsFamilyState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { currentViewSortsScopedFamilyState } from '../states/currentViewSortsScopedFamilyState';
import { savedViewFiltersScopedFamilyState } from '../states/savedViewFiltersScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../states/savedViewSortsScopedFamilyState';
import { viewEditModeScopedState } from '../states/viewEditModeScopedState';
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
    setCurrentViewId,
    currentViewId,

    setViews,
    setViewEditMode,
    setViewObjectId,
    setViewType,
    setEntityCountInCurrentView,
    setIsViewBarExpanded,

    setAvailableSorts,
    setCurrentViewSorts,
    setSavedViewSorts,

    setAvailableFilters,
    setCurrentViewFilters,
    setSavedViewFilters,

    setAvailableFields,
    setCurrentViewFields,
    setSavedViewFields,
  } = useViewStates(scopeId);

  const { persistViewSorts, upsertViewSort } = useViewSorts(scopeId);
  const { persistViewFilters } = useViewFilters(scopeId);
  const { persistViewFields } = useViewFields(scopeId);
  const { createView: internalCreateView, deleteView: internalDeleteView } =
    useViews(scopeId);
  const [_, setSearchParams] = useSearchParams();

  const changeView = useCallback(
    (viewId: string) => {
      setSearchParams({ view: viewId });
    },
    [setSearchParams],
  );

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
    setIsViewBarExpanded?.(false);
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

        changeView(newViewId);
      },
    [
      changeView,
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
    ({ snapshot, set }) =>
      async (name?: string) => {
        const viewEditMode = snapshot
          .getLoadable(viewEditModeScopedState({ scopeId }))
          .getValue();

        const currentViewFields = snapshot
          .getLoadable(
            currentViewFieldsScopedFamilyState({
              scopeId,
              familyKey: currentViewId || '',
            }),
          )
          .getValue();

        const isCreateModeOrEditMode = viewEditMode === 'create' || 'edit';

        if (isCreateModeOrEditMode && name && currentViewFields) {
          await createView(name);
          set(savedTableColumnsFamilyState(currentViewId), currentViewFields);
        }
      },
    [createView, currentViewId, scopeId],
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

    setAvailableSorts,
    setCurrentViewSorts,
    setSavedViewSorts,
    upsertViewSort,

    setAvailableFilters,
    setCurrentViewFilters,
    setSavedViewFilters,

    setAvailableFields,
    setCurrentViewFields,
    setSavedViewFields,

    persistViewFields,
    changeView,
  };
};
