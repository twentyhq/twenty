import { getScopedFamilyStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedFamilyStateDeprecated';
import { getScopedSelectorDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedSelectorDeprecated';
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { isPersistingViewScopedState } from '@/views/states/isPersistingViewScopedState';
import { onViewTypeChangeScopedState } from '@/views/states/onViewTypeChangeScopedState';
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
  const viewEditModeState = getScopedStateDeprecated(
    viewEditModeScopedState,
    viewScopeId,
  );

  const viewsState = getScopedStateDeprecated(viewsScopedState, viewScopeId);

  const viewObjectMetadataIdState = getScopedStateDeprecated(
    viewObjectMetadataIdScopeState,
    viewScopeId,
  );

  const viewTypeState = getScopedStateDeprecated(
    viewTypeScopedState,
    viewScopeId,
  );

  const entityCountInCurrentViewState = getScopedStateDeprecated(
    entityCountInCurrentViewScopedState,
    viewScopeId,
  );

  const isViewBarExpandedState = getScopedStateDeprecated(
    isViewBarExpandedScopedState,
    viewScopeId,
  );

  const isPersistingViewState = getScopedStateDeprecated(
    isPersistingViewScopedState,
    viewScopeId,
  );

  // ViewSorts
  const currentViewSortsState = getScopedFamilyStateDeprecated(
    currentViewSortsScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewSortsState = getScopedFamilyStateDeprecated(
    savedViewSortsScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewSortsByKeySelector = savedViewSortsByKeyScopedFamilySelector({
    scopeId: viewScopeId,
    viewId: viewId,
  });

  const availableSortDefinitionsState = getScopedStateDeprecated(
    availableSortDefinitionsScopedState,
    viewScopeId,
  );

  const canPersistSortsSelector = canPersistViewSortsScopedFamilySelector({
    viewScopeId: viewScopeId,
    viewId: viewId,
  });

  // ViewFilters
  const currentViewFiltersState = getScopedFamilyStateDeprecated(
    currentViewFiltersScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewFiltersState = getScopedFamilyStateDeprecated(
    savedViewFiltersScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewFiltersByKeySelector =
    savedViewFiltersByKeyScopedFamilySelector({
      scopeId: viewScopeId,
      viewId: viewId,
    });

  const availableFilterDefinitionsState = getScopedStateDeprecated(
    availableFilterDefinitionsScopedState,
    viewScopeId,
  );

  const canPersistFiltersSelector = canPersistViewFiltersScopedFamilySelector({
    viewScopeId: viewScopeId,
    viewId: viewId,
  });

  // ViewFields
  const availableFieldDefinitionsState = getScopedStateDeprecated(
    availableFieldDefinitionsScopedState,
    viewScopeId,
  );

  const currentViewFieldsState = getScopedFamilyStateDeprecated(
    currentViewFieldsScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewFieldsState = getScopedFamilyStateDeprecated(
    savedViewFieldsScopedFamilyState,
    viewScopeId,
    viewId,
  );

  const savedViewFieldsByKeySelector = savedViewFieldByKeyScopedFamilySelector({
    viewScopeId,
    viewId,
  });

  // ViewChangeHandlers
  const onViewSortsChangeState = getScopedStateDeprecated(
    onViewSortsChangeScopedState,
    viewScopeId,
  );

  const onViewFiltersChangeState = getScopedStateDeprecated(
    onViewFiltersChangeScopedState,
    viewScopeId,
  );

  const onViewFieldsChangeState = getScopedStateDeprecated(
    onViewFieldsChangeScopedState,
    viewScopeId,
  );

  const onViewTypeChangeState = getScopedStateDeprecated(
    onViewTypeChangeScopedState,
    viewScopeId,
  );

  const currentViewIdState = getScopedStateDeprecated(
    currentViewIdScopedState,
    viewScopeId,
  );

  const currentViewSelector = getScopedSelectorDeprecated(
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
    onViewTypeChangeState,
  };
};
