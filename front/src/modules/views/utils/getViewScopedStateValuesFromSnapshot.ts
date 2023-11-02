import { Snapshot } from 'recoil';

import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { UNDEFINED_FAMILY_ITEM_ID } from '../constants';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';

import { getViewScopedStates } from './internal/getViewScopedStates';

export const getViewScopedStateValuesFromSnapshot = ({
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

  const familyItemId = viewId ?? currentViewId ?? UNDEFINED_FAMILY_ITEM_ID;

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
    viewId: familyItemId,
  });

  return {
    availableFieldDefinitions: getSnapshotValue(
      snapshot,
      availableFieldDefinitionsState,
    ),
    availableFilterDefinitions: getSnapshotValue(
      snapshot,
      availableFilterDefinitionsState,
    ),
    availableSortDefinitions: getSnapshotValue(
      snapshot,
      availableSortDefinitionsState,
    ),
    canPersistFilters: getSnapshotValue(
      snapshot,
      canPersistFiltersReadOnlyState,
    ),
    canPersistSorts: getSnapshotValue(snapshot, canPersistSortsReadOnlyState),
    currentViewFields: getSnapshotValue(snapshot, currentViewFieldsState),
    currentViewFilters: getSnapshotValue(snapshot, currentViewFiltersState),
    currentViewId: getSnapshotValue(snapshot, currentViewIdState),
    currentView: getSnapshotValue(snapshot, currentViewSelector),
    currentViewSorts: getSnapshotValue(snapshot, currentViewSortsState),
    entityCountInCurrentView: getSnapshotValue(
      snapshot,
      entityCountInCurrentViewState,
    ),
    isViewBarExpanded: getSnapshotValue(snapshot, isViewBarExpandedState),
    onViewFieldsChange: getSnapshotValue(snapshot, onViewFieldsChangeState),
    onViewFiltersChange: getSnapshotValue(snapshot, onViewFiltersChangeState),
    onViewSortsChange: getSnapshotValue(snapshot, onViewSortsChangeState),
    savedViewFieldsByKey: getSnapshotValue(
      snapshot,
      savedViewFieldsByKeyReadOnlyState,
    ),
    savedViewFields: getSnapshotValue(snapshot, savedViewFieldsState),
    savedViewFiltersByKey: getSnapshotValue(
      snapshot,
      savedViewFiltersByKeyReadOnlyState,
    ),
    savedViewFilters: getSnapshotValue(snapshot, savedViewFiltersState),
    savedViewSortsByKey: getSnapshotValue(
      snapshot,
      savedViewSortsByKeyReadOnlyState,
    ),
    savedViewSorts: getSnapshotValue(snapshot, savedViewSortsState),
    viewEditMode: getSnapshotValue(snapshot, viewEditModeState),
    viewObjectId: getSnapshotValue(snapshot, viewObjectIdState),
    viewType: getSnapshotValue(snapshot, viewTypeState),
    views: getSnapshotValue(snapshot, viewsState),
  };
};
