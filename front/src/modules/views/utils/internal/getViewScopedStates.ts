import { getScopedFamilyState } from '@/ui/utilities/recoil-scope/utils/getScopedFamilyState';
import { getScopedSelector } from '@/ui/utilities/recoil-scope/utils/getScopedSelector';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { isPersistingViewScopedState } from '@/views/states/isPersistingViewScopedState';
import { currentViewScopedSelector } from '@/views/states/selectors/currentViewScopedSelector';

import { availableFieldDefinitionsScopedState } from '../../states/availableFieldDefinitionsScopedState';
import { availableFilterDefinitionsScopedState } from '../../states/availableFilterDefinitionsScopedState';
import { availableSortDefinitionsScopedState } from '../../states/availableSortDefinitionsScopedState';
import { currentViewFieldsScopedFamilyState } from '../../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../../states/currentViewFiltersScopedFamilyState';
import { currentViewSortsScopedFamilyState } from '../../states/currentViewSortsScopedFamilyState';
import { entityCountInCurrentViewScopedState } from '../../states/entityCountInCurrentViewScopedState';
import { isViewBarExpandedScopedState } from '../../states/isViewBarExpandedScopedState';
import { onViewFieldsChangeScopedState } from '../../states/onViewFieldsChangeScopedState';
import { onViewFiltersChangeScopedState } from '../../states/onViewFiltersChangeScopedState';
import { onViewSortsChangeScopedState } from '../../states/onViewSortsChangeScopedState';
import { savedViewFieldsScopedFamilyState } from '../../states/savedViewFieldsScopedFamilyState';
import { savedViewFiltersScopedFamilyState } from '../../states/savedViewFiltersScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../../states/savedViewSortsScopedFamilyState';
import { canPersistViewFiltersScopedFamilySelector } from '../../states/selectors/canPersistViewFiltersScopedFamilySelector';
import { canPersistViewSortsScopedFamilySelector } from '../../states/selectors/canPersistViewSortsScopedFamilySelector';
import { savedViewFieldByKeyScopedFamilySelector } from '../../states/selectors/savedViewFieldByKeyScopedFamilySelector';
import { savedViewFiltersByKeyScopedFamilySelector } from '../../states/selectors/savedViewFiltersByKeyScopedFamilySelector';
import { savedViewSortsByKeyScopedFamilySelector } from '../../states/selectors/savedViewSortsByKeyScopedFamilySelector';
import { viewEditModeScopedState } from '../../states/viewEditModeScopedState';
import { viewObjectMetadataIdScopeState } from '../../states/viewObjectMetadataIdScopeState';
import { viewsScopedState } from '../../states/viewsScopedState';
import { viewTypeScopedState } from '../../states/viewTypeScopedState';

export const getViewScopedStates = ({
  viewScopeId,
  viewId,
}: {
  viewScopeId: string;
  viewId: string;
}) => {
  const viewEditModeState = getScopedState(
    viewEditModeScopedState,
    viewScopeId,
  );

  const viewsState = getScopedState(viewsScopedState, viewScopeId);

  const viewObjectMetadataIdState = getScopedState(
    viewObjectMetadataIdScopeState,
    viewScopeId,
  );

  const viewTypeState = getScopedState(viewTypeScopedState, viewScopeId);

  const entityCountInCurrentViewState = getScopedState(
    entityCountInCurrentViewScopedState,
    viewScopeId,
  );

  const isViewBarExpandedState = getScopedState(
    isViewBarExpandedScopedState,
    viewScopeId,
  );

  const isPersistingViewState = getScopedState(
    isPersistingViewScopedState,
    viewScopeId,
  );

  // ViewSorts
  const currentViewSortsState = getScopedFamilyState(
    currentViewSortsScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewSortsState = getScopedFamilyState(
    savedViewSortsScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewSortsByKeySelector = savedViewSortsByKeyScopedFamilySelector({
    scopeId: viewScopeId,
    viewId: viewId,
  });

  const availableSortDefinitionsState = getScopedState(
    availableSortDefinitionsScopedState,
    viewScopeId,
  );

  const canPersistSortsSelector = canPersistViewSortsScopedFamilySelector({
    viewScopeId: viewScopeId,
    viewId: viewId,
  });

  // ViewFilters
  const currentViewFiltersState = getScopedFamilyState(
    currentViewFiltersScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewFiltersState = getScopedFamilyState(
    savedViewFiltersScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewFiltersByKeySelector =
    savedViewFiltersByKeyScopedFamilySelector({
      scopeId: viewScopeId,
      viewId: viewId,
    });

  const availableFilterDefinitionsState = getScopedState(
    availableFilterDefinitionsScopedState,
    viewScopeId,
  );

  const canPersistFiltersSelector = canPersistViewFiltersScopedFamilySelector({
    viewScopeId: viewScopeId,
    viewId: viewId,
  });

  // ViewFields
  const availableFieldDefinitionsState = getScopedState(
    availableFieldDefinitionsScopedState,
    viewScopeId,
  );

  const currentViewFieldsState = getScopedFamilyState(
    currentViewFieldsScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewFieldsState = getScopedFamilyState(
    savedViewFieldsScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewFieldsByKeySelector = savedViewFieldByKeyScopedFamilySelector({
    viewScopeId,
    viewId,
  });

  // ViewChangeHandlers
  const onViewSortsChangeState = getScopedState(
    onViewSortsChangeScopedState,
    viewScopeId,
  );

  const onViewFiltersChangeState = getScopedState(
    onViewFiltersChangeScopedState,
    viewScopeId,
  );

  const onViewFieldsChangeState = getScopedState(
    onViewFieldsChangeScopedState,
    viewScopeId,
  );

  const currentViewIdState = getScopedState(
    currentViewIdScopedState,
    viewScopeId,
  );

  const currentViewSelector = getScopedSelector(
    currentViewScopedSelector,
    viewScopeId,
  );

  return {
    currentViewIdState,
    currentViewSelector,

    isViewBarExpandedState,
    isPersistingViewState,

    viewsState,
    viewEditModeState,
    viewObjectMetadataIdState,
    viewTypeState,
    entityCountInCurrentViewState,

    availableSortDefinitionsState,
    currentViewSortsState,
    savedViewSortsState,
    savedViewSortsByKeySelector,
    canPersistSortsSelector,

    availableFilterDefinitionsState,
    currentViewFiltersState,
    savedViewFiltersState,
    savedViewFiltersByKeySelector,
    canPersistFiltersSelector,

    availableFieldDefinitionsState,
    currentViewFieldsState,
    savedViewFieldsByKeySelector,
    savedViewFieldsState,

    onViewSortsChangeState,
    onViewFiltersChangeState,
    onViewFieldsChangeState,
  };
};
