import { useRecoilState } from 'recoil';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';

import { UNDEFINED_FAMILY_ITEM_ID } from '../../constants';
import { ViewScopeInternalContext } from '../../scopes/scope-internal-context/ViewScopeInternalContext';
import { currentViewIdScopedState } from '../../states/currentViewIdScopedState';
import { getViewScopedStates } from '../../utils/internal/getViewScopedStates';

export const useViewScopedStates = (args?: { viewScopeId?: string }) => {
  const { viewScopeId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewScopeId,
  );

  // View
  const [currentViewId] = useRecoilState(
    getScopedStateDeprecated(currentViewIdScopedState, scopeId),
  );

  const viewId = currentViewId ?? UNDEFINED_FAMILY_ITEM_ID;

  const {
    availableFieldDefinitionsState,
    availableFilterDefinitionsState,
    availableSortDefinitionsState,
    canPersistFiltersSelector,
    canPersistSortsSelector,
    currentViewFieldsState,
    currentViewFiltersState,
    currentViewIdState,
    currentViewSelector,
    currentViewSortsState,
    entityCountInCurrentViewState,
    isViewBarExpandedState,
    isPersistingViewState,
    onViewFieldsChangeState,
    onViewFiltersChangeState,
    onViewSortsChangeState,
    onViewTypeChangeState,
    savedViewFieldsByKeySelector,
    savedViewFieldsState,
    savedViewFiltersByKeySelector,
    savedViewFiltersState,
    savedViewSortsByKeySelector,
    savedViewSortsState,
    viewEditModeState,
    viewObjectMetadataIdState,
    viewTypeState,
    viewsState,
  } = getViewScopedStates({
    viewScopeId: scopeId,
    viewId,
  });

  return {
    availableFieldDefinitionsState,
    availableFilterDefinitionsState,
    availableSortDefinitionsState,
    canPersistFiltersSelector,
    canPersistSortsSelector,
    currentViewFieldsState,
    currentViewFiltersState,
    currentViewIdState,
    currentViewSelector,
    currentViewSortsState,
    entityCountInCurrentViewState,
    isViewBarExpandedState,
    isPersistingViewState,
    onViewFieldsChangeState,
    onViewFiltersChangeState,
    onViewSortsChangeState,
    onViewTypeChangeState,
    savedViewFieldsByKeySelector,
    savedViewFieldsState,
    savedViewFiltersByKeySelector,
    savedViewFiltersState,
    savedViewSortsByKeySelector,
    savedViewSortsState,
    viewEditModeState,
    viewObjectMetadataIdState,
    viewTypeState,
    viewsState,
  };
};
