import { Snapshot } from 'recoil';

import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';
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
    getScopedStateDeprecated(currentViewIdScopedState, viewScopeId),
  );

  const familyItemId = viewId ?? currentViewId ?? UNDEFINED_FAMILY_ITEM_ID;

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
    canPersistFilters: getSnapshotValue(snapshot, canPersistFiltersSelector),
    canPersistSorts: getSnapshotValue(snapshot, canPersistSortsSelector),
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
    isPersistingView: getSnapshotValue(snapshot, isPersistingViewState),
    onViewFieldsChange: getSnapshotValue(snapshot, onViewFieldsChangeState),
    onViewFiltersChange: getSnapshotValue(snapshot, onViewFiltersChangeState),
    onViewSortsChange: getSnapshotValue(snapshot, onViewSortsChangeState),
    onViewTypeChange: getSnapshotValue(snapshot, onViewTypeChangeState),
    savedViewFieldsByKey: getSnapshotValue(
      snapshot,
      savedViewFieldsByKeySelector,
    ),
    savedViewFields: getSnapshotValue(snapshot, savedViewFieldsState),
    savedViewFiltersByKey: getSnapshotValue(
      snapshot,
      savedViewFiltersByKeySelector,
    ),
    savedViewFilters: getSnapshotValue(snapshot, savedViewFiltersState),
    savedViewSortsByKey: getSnapshotValue(
      snapshot,
      savedViewSortsByKeySelector,
    ),
    savedViewSorts: getSnapshotValue(snapshot, savedViewSortsState),
    viewEditMode: getSnapshotValue(snapshot, viewEditModeState),
    viewObjectMetadataId: getSnapshotValue(snapshot, viewObjectMetadataIdState),
    viewType: getSnapshotValue(snapshot, viewTypeState),
    views: getSnapshotValue(snapshot, viewsState),
  };
};
