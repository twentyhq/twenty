import { Snapshot } from 'recoil';

import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { UNDEFINED_FAMILY_ITEM_ID } from '../constants';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';

import { getViewScopedStates } from './internal/getViewScopedStates';

export const getViewScopedStatesFromSnapshot = ({
  snapshot,
  viewScopeId,
  viewId,
}: {
  snapshot: Snapshot;
  viewScopeId: string;
  viewId?: string;
}) => {
  const currentViewId = getSnapshotValue(
    snapshot,
    getScopedStateDeprecated(currentViewIdScopedState, viewScopeId),
  );

  const usedViewId = viewId ?? currentViewId ?? UNDEFINED_FAMILY_ITEM_ID;

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
    viewScopeId,
    viewId: usedViewId,
  });

  return {
    availableFieldDefinitionsState,
    availableFilterDefinitionsState,
    availableSortDefinitionsState,
    canPersistFiltersReadOnlyState: canPersistFiltersSelector,
    canPersistSortsReadOnlyState: canPersistSortsSelector,
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
    savedViewFieldsByKeyReadOnlyState: savedViewFieldsByKeySelector,
    savedViewFieldsState,
    savedViewFiltersByKeyReadOnlyState: savedViewFiltersByKeySelector,
    savedViewFiltersState,
    savedViewSortsByKeyReadOnlyState: savedViewSortsByKeySelector,
    savedViewSortsState,
    viewEditModeState,
    viewObjectMetadataIdState,
    viewTypeState,
    viewsState,
  };
};
