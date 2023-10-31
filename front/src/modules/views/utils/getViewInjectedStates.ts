import { getInjectedScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/getInjectedScopedFamilyState';
import { getInjectedScopedState } from '@/ui/utilities/recoil-scope/utils/getInjectedScopedState';

import { availableFieldDefinitionsScopedState } from '../states/availableFieldDefinitionsScopedState';
import { availableFilterDefinitionsScopedState } from '../states/availableFilterDefinitionsScopedState';
import { availableSortDefinitionsScopedState } from '../states/availableSortDefinitionsScopedState';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewSortsScopedFamilyState } from '../states/currentViewSortsScopedFamilyState';
import { entityCountInCurrentViewScopedState } from '../states/entityCountInCurrentViewScopedState';
import { isViewBarExpandedScopedState } from '../states/isViewBarExpandedScopedState';
import { onViewFieldsChangeScopedState } from '../states/onViewFieldsChangeScopedState';
import { onViewFiltersChangeScopedState } from '../states/onViewFiltersChangeScopedState';
import { onViewSortsChangeScopedState } from '../states/onViewSortsChangeScopedState';
import { savedViewFieldsScopedFamilyState } from '../states/savedViewFieldsScopedFamilyState';
import { savedViewFiltersScopedFamilyState } from '../states/savedViewFiltersScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../states/savedViewSortsScopedFamilyState';
import { canPersistViewFiltersScopedFamilySelector } from '../states/selectors/canPersistViewFiltersScopedFamilySelector';
import { canPersistViewSortsScopedFamilySelector } from '../states/selectors/canPersistViewSortsScopedFamilySelector';
import { savedViewFieldByKeyScopedFamilySelector } from '../states/selectors/savedViewFieldByKeyScopedFamilySelector';
import { savedViewFiltersByKeyScopedFamilySelector } from '../states/selectors/savedViewFiltersByKeyScopedFamilySelector';
import { savedViewSortsByKeyScopedFamilySelector } from '../states/selectors/savedViewSortsByKeyScopedFamilySelector';
import { viewEditModeScopedState } from '../states/viewEditModeScopedState';
import { viewObjectIdScopeState } from '../states/viewObjectIdScopeState';
import { viewsScopedState } from '../states/viewsScopedState';
import { viewTypeScopedState } from '../states/viewTypeScopedState';

export const getViewInjectedStates = ({
  viewScopeId,
  familyItemId,
}: {
  viewScopeId: string;
  familyItemId: string;
}) => {
  const viewEditModeState = getInjectedScopedState(
    viewEditModeScopedState,
    viewScopeId,
  );

  const viewsState = getInjectedScopedState(viewsScopedState, viewScopeId);

  const viewObjectIdState = getInjectedScopedState(
    viewObjectIdScopeState,
    viewScopeId,
  );

  const viewTypeState = getInjectedScopedState(
    viewTypeScopedState,
    viewScopeId,
  );

  const entityCountInCurrentViewState = getInjectedScopedState(
    entityCountInCurrentViewScopedState,
    viewScopeId,
  );

  const isViewBarExpandedState = getInjectedScopedState(
    isViewBarExpandedScopedState,
    viewScopeId,
  );

  // ViewSorts
  const currentViewSortsState = getInjectedScopedFamilyState(
    currentViewSortsScopedFamilyState,
    viewScopeId,
    familyItemId,
  );

  const savedViewSortsState = getInjectedScopedFamilyState(
    savedViewSortsScopedFamilyState,
    viewScopeId,
    familyItemId,
  );

  const savedViewSortsByKeyReadOnlyState =
    savedViewSortsByKeyScopedFamilySelector({
      scopeId: viewScopeId,
      viewId: familyItemId,
    });

  const availableSortDefinitionsState = getInjectedScopedState(
    availableSortDefinitionsScopedState,
    viewScopeId,
  );

  const canPersistSortsReadOnlyState = canPersistViewSortsScopedFamilySelector({
    viewScopeId: viewScopeId,
    viewId: familyItemId,
  });

  // ViewFilters
  const currentViewFiltersState = getInjectedScopedFamilyState(
    currentViewFiltersScopedFamilyState,
    viewScopeId,
    familyItemId,
  );

  const savedViewFiltersState = getInjectedScopedFamilyState(
    savedViewFiltersScopedFamilyState,
    viewScopeId,
    familyItemId,
  );

  const savedViewFiltersByKeyReadOnlyState =
    savedViewFiltersByKeyScopedFamilySelector({
      scopeId: viewScopeId,
      viewId: familyItemId,
    });

  const availableFilterDefinitionsState = getInjectedScopedState(
    availableFilterDefinitionsScopedState,
    viewScopeId,
  );

  const canPersistFiltersReadOnlyState =
    canPersistViewFiltersScopedFamilySelector({
      viewScopeId: viewScopeId,
      viewId: familyItemId,
    });

  // ViewFields
  const availableFieldDefinitionsState = getInjectedScopedState(
    availableFieldDefinitionsScopedState,
    viewScopeId,
  );

  const currentViewFieldsState = getInjectedScopedFamilyState(
    currentViewFieldsScopedFamilyState,
    viewScopeId,
    familyItemId,
  );

  const savedViewFieldsState = getInjectedScopedFamilyState(
    savedViewFieldsScopedFamilyState,
    viewScopeId,
    familyItemId,
  );

  const savedViewFieldsByKeyReadOnlyState =
    savedViewFieldByKeyScopedFamilySelector({
      viewScopeId: viewScopeId,
      viewId: familyItemId,
    });

  // ViewChangeHandlers
  const onViewSortsChangeState = getInjectedScopedState(
    onViewSortsChangeScopedState,
    viewScopeId,
  );

  const onViewFiltersChangeState = getInjectedScopedState(
    onViewFiltersChangeScopedState,
    viewScopeId,
  );

  const onViewFieldsChangeState = getInjectedScopedState(
    onViewFieldsChangeScopedState,
    viewScopeId,
  );

  return {
    isViewBarExpandedState,

    viewsState,
    viewEditModeState,
    viewObjectIdState,
    viewTypeState,
    entityCountInCurrentViewState,

    availableSortDefinitionsState,
    currentViewSortsState,
    savedViewSortsState,
    savedViewSortsByKeyReadOnlyState,
    canPersistSortsReadOnlyState,

    availableFilterDefinitionsState,
    currentViewFiltersState,
    savedViewFiltersState,
    savedViewFiltersByKeyReadOnlyState,
    canPersistFiltersReadOnlyState,

    availableFieldDefinitionsState,
    currentViewFieldsState,
    savedViewFieldsByKeyReadOnlyState,
    savedViewFieldsState,

    onViewSortsChangeState,
    onViewFiltersChangeState,
    onViewFieldsChangeState,
  };
};
