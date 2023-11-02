import { Snapshot } from 'recoil';

import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';
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
    getScopedState(currentViewIdScopedState, viewScopeId),
  );

  const usedViewId = viewId ?? currentViewId ?? UNDEFINED_FAMILY_ITEM_ID;

  const {
    availableFieldDefinitionsState,
    availableFilterDefinitionsState,
    availableSortDefinitionsState,
    canPersistFiltersSelector: canPersistFiltersReadOnlyState,
    canPersistSortsSelector: canPersistSortsReadOnlyState,
    currentViewFieldsState,
    currentViewFiltersState,
    currentViewIdState,
    currentViewSelector,
    currentViewSortsState,
    entityCountInCurrentViewState,
    isViewBarExpandedState,
    onViewFieldsChangeState,
    onViewFiltersChangeState,
    onViewSortsChangeState,
    savedViewFieldsByKeySelector: savedViewFieldsByKeyReadOnlyState,
    savedViewFieldsState,
    savedViewFiltersByKeySelector: savedViewFiltersByKeyReadOnlyState,
    savedViewFiltersState,
    savedViewSortsByKeySelector: savedViewSortsByKeyReadOnlyState,
    savedViewSortsState,
    viewEditModeState,
    viewObjectIdState,
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
    canPersistFiltersReadOnlyState,
    canPersistSortsReadOnlyState,
    currentViewFieldsState,
    currentViewFiltersState,
    currentViewIdState,
    currentViewSelector,
    currentViewSortsState,
    entityCountInCurrentViewState,
    isViewBarExpandedState,
    onViewFieldsChangeState,
    onViewFiltersChangeState,
    onViewSortsChangeState,
    savedViewFieldsByKeyReadOnlyState,
    savedViewFieldsState,
    savedViewFiltersByKeyReadOnlyState,
    savedViewFiltersState,
    savedViewSortsByKeyReadOnlyState,
    savedViewSortsState,
    viewEditModeState,
    viewObjectIdState,
    viewTypeState,
    viewsState,
  };
};
