import { useRecoilState } from 'recoil';

import { useSetRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedFamilyState';
import { useSetRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedStateV2';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { UNDEFINED_FAMILY_ITEM_ID } from '../constants';
import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
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
import { viewEditModeScopedState } from '../states/viewEditModeScopedState';

import { useViewScopedStates } from './useViewScopedStates';

export const useViewSetStates = (viewScopeId?: string, viewId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewScopeId,
  );
  // View
  const { currentViewIdState, viewObjectIdState, viewTypeState, viewsState } =
    useViewScopedStates({
      customViewScopeId: scopeId,
    });

  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);
  const [, setViewObjectId] = useRecoilState(viewObjectIdState);
  const [, setViewType] = useRecoilState(viewTypeState);
  const [, setViews] = useRecoilState(viewsState);

  const familyItemId = viewId ?? currentViewId ?? UNDEFINED_FAMILY_ITEM_ID;

  const setViewEditMode = useSetRecoilScopedStateV2(
    viewEditModeScopedState,
    scopeId,
  );

  const setEntityCountInCurrentView = useSetRecoilScopedStateV2(
    entityCountInCurrentViewScopedState,
    scopeId,
  );

  const setIsViewBarExpanded = useSetRecoilScopedStateV2(
    isViewBarExpandedScopedState,
    scopeId,
  );

  // ViewSorts
  const setCurrentViewSorts = useSetRecoilScopedFamilyState(
    currentViewSortsScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const setSavedViewSorts = useSetRecoilScopedFamilyState(
    savedViewSortsScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const setAvailableSortDefinitions = useSetRecoilScopedStateV2(
    availableSortDefinitionsScopedState,
    scopeId,
  );

  // ViewFilters
  const setCurrentViewFilters = useSetRecoilScopedFamilyState(
    currentViewFiltersScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const setSavedViewFilters = useSetRecoilScopedFamilyState(
    savedViewFiltersScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const setAvailableFilterDefinitions = useSetRecoilScopedStateV2(
    availableFilterDefinitionsScopedState,
    scopeId,
  );

  // ViewFields
  const setAvailableFieldDefinitions = useSetRecoilScopedStateV2(
    availableFieldDefinitionsScopedState,
    scopeId,
  );

  const setCurrentViewFields = useSetRecoilScopedFamilyState(
    currentViewFieldsScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const setSavedViewFields = useSetRecoilScopedFamilyState(
    savedViewFieldsScopedFamilyState,
    scopeId,
    familyItemId,
  );

  const setOnViewFieldsChange = useSetRecoilScopedStateV2(
    onViewFieldsChangeScopedState,
    scopeId,
  );

  const setOnViewFiltersChange = useSetRecoilScopedStateV2(
    onViewFiltersChangeScopedState,
    scopeId,
  );

  const setOnViewSortsChange = useSetRecoilScopedStateV2(
    onViewSortsChangeScopedState,
    scopeId,
  );

  return {
    currentViewId,
    setCurrentViewId,
    setIsViewBarExpanded,
    setViewObjectId,
    setViewType,

    setViews,
    setViewEditMode,
    setEntityCountInCurrentView,

    setAvailableSortDefinitions,
    setCurrentViewSorts,
    setSavedViewSorts,

    setAvailableFilterDefinitions,
    setCurrentViewFilters,
    setSavedViewFilters,

    setAvailableFieldDefinitions,
    setCurrentViewFields,
    setSavedViewFields,

    setOnViewFieldsChange,
    setOnViewFiltersChange,
    setOnViewSortsChange,
  };
};
