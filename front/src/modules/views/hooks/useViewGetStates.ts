import { useRecoilValue } from 'recoil';

import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { availableFieldDefinitionsScopedState } from '../states/availableFieldDefinitionsScopedState';
import { availableFilterDefinitionsScopedState } from '../states/availableFilterDefinitionsScopedState';
import { availableSortDefinitionsScopedState } from '../states/availableSortDefinitionsScopedState';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
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
import { currentViewScopedSelector } from '../states/selectors/currentViewScopedSelector';
import { savedViewFieldByKeyScopedFamilySelector } from '../states/selectors/savedViewFieldByKeyScopedFamilySelector';
import { savedViewFiltersByKeyScopedFamilySelector } from '../states/selectors/savedViewFiltersByKeyScopedFamilySelector';
import { savedViewSortsByKeyScopedFamilySelector } from '../states/selectors/savedViewSortsByKeyScopedFamilySelector';
import { viewEditModeScopedState } from '../states/viewEditModeScopedState';
import { viewObjectIdScopeState } from '../states/viewObjectIdScopeState';
import { viewsScopedState } from '../states/viewsScopedState';
import { viewTypeScopedState } from '../states/viewTypeScopedState';

export const useViewGetStates = (viewScopeId?: string, viewId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewScopeId,
  );

  // View
  const [currentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    scopeId,
  );

  const familyItemId = viewId ?? currentViewId;

  const currentView = useRecoilValue(currentViewScopedSelector(scopeId));

  const [viewEditMode] = useRecoilScopedStateV2(
    viewEditModeScopedState,
    scopeId,
  );

  const [views] = useRecoilScopedStateV2(viewsScopedState, scopeId);

  const [viewObjectId] = useRecoilScopedStateV2(
    viewObjectIdScopeState,
    scopeId,
  );

  const [viewType] = useRecoilScopedStateV2(viewTypeScopedState, scopeId);

  const [entityCountInCurrentView] = useRecoilScopedStateV2(
    entityCountInCurrentViewScopedState,
    scopeId,
  );

  const [isViewBarExpanded] = useRecoilScopedStateV2(
    isViewBarExpandedScopedState,
    scopeId,
  );

  // ViewSorts
  const [currentViewSorts] = useRecoilScopedFamilyState(
    currentViewSortsScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const [savedViewSorts] = useRecoilScopedFamilyState(
    savedViewSortsScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const savedViewSortsByKey = useRecoilValue(
    savedViewSortsByKeyScopedFamilySelector({
      scopeId: scopeId,
      viewId: familyItemId,
    }),
  );

  const [availableSortDefinitions] = useRecoilScopedStateV2(
    availableSortDefinitionsScopedState,
    scopeId,
  );

  const canPersistSorts = useRecoilValue(
    canPersistViewSortsScopedFamilySelector({
      viewScopeId: scopeId,
      viewId: familyItemId,
    }),
  );

  // ViewFilters
  const [currentViewFilters] = useRecoilScopedFamilyState(
    currentViewFiltersScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const [savedViewFilters] = useRecoilScopedFamilyState(
    savedViewFiltersScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const savedViewFiltersByKey = useRecoilValue(
    savedViewFiltersByKeyScopedFamilySelector({
      scopeId: scopeId,
      viewId: familyItemId,
    }),
  );

  const [availableFilterDefinitions] = useRecoilScopedStateV2(
    availableFilterDefinitionsScopedState,
    scopeId,
  );

  const canPersistFilters = useRecoilValue(
    canPersistViewFiltersScopedFamilySelector({
      viewScopeId: scopeId,
      viewId: familyItemId,
    }),
  );

  // ViewFields
  const [availableFieldDefinitions] = useRecoilScopedStateV2(
    availableFieldDefinitionsScopedState,
    scopeId,
  );

  const [currentViewFields] = useRecoilScopedFamilyState(
    currentViewFieldsScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const [savedViewFields] = useRecoilScopedFamilyState(
    savedViewFieldsScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const savedViewFieldsByKey = useRecoilValue(
    savedViewFieldByKeyScopedFamilySelector({
      viewScopeId: scopeId,
      viewId: familyItemId,
    }),
  );

  // ViewChangeHandlers
  const [onViewSortsChange] = useRecoilScopedStateV2(
    onViewSortsChangeScopedState,
    scopeId,
  );

  const [onViewFiltersChange] = useRecoilScopedStateV2(
    onViewFiltersChangeScopedState,
    scopeId,
  );

  const [onViewFieldsChange] = useRecoilScopedStateV2(
    onViewFieldsChangeScopedState,
    scopeId,
  );

  return {
    currentViewId,
    currentView,
    isViewBarExpanded,

    views,
    viewEditMode,
    viewObjectId,
    viewType,
    entityCountInCurrentView,

    availableSortDefinitions,
    currentViewSorts,
    savedViewSorts,
    savedViewSortsByKey,
    canPersistSorts,

    availableFilterDefinitions,
    currentViewFilters,
    savedViewFilters,
    savedViewFiltersByKey,
    canPersistFilters,

    availableFieldDefinitions,
    currentViewFields,
    savedViewFieldsByKey,
    savedViewFields,

    onViewSortsChange,
    onViewFiltersChange,
    onViewFieldsChange,
  };
};
