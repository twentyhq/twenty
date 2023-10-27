import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { useSetRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedFamilyState';
import { useSetRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedStateV2';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { availableFieldsScopedState } from '../states/availableFieldsScopedState';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { currentViewSortsScopedFamilyState } from '../states/currentViewSortsScopedFamilyState';
import { entityCountInCurrentViewScopedState } from '../states/entityCountInCurrentViewScopedState';
import { isViewBarExpandedScopedState } from '../states/isViewBarExpandedScopedState';
import { savedViewFieldsScopedFamilyState } from '../states/savedViewFieldsScopedFamilyState';
import { savedViewFiltersScopedFamilyState } from '../states/savedViewFiltersScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../states/savedViewSortsScopedFamilyState';
import { viewEditModeScopedState } from '../states/viewEditModeScopedState';
import { viewObjectIdScopeState } from '../states/viewObjectIdScopeState';
import { viewsScopedState } from '../states/viewsScopedState';
import { viewTypeScopedState } from '../states/viewTypeScopedState';

export const useViewStates = (viewScopeId?: string, viewId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    viewScopeId,
  );
  // View
  const [currentViewId, setCurrentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    scopeId,
  );

  const familyItemId = viewId ? viewId : currentViewId;

  const setViewEditMode = useSetRecoilScopedStateV2(
    viewEditModeScopedState,
    scopeId,
  );

  const setViews = useSetRecoilScopedStateV2(viewsScopedState, scopeId);

  const setViewObjectId = useSetRecoilScopedStateV2(
    viewObjectIdScopeState,
    scopeId,
  );

  const setViewType = useSetRecoilScopedStateV2(viewTypeScopedState, scopeId);

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

  const setAvailableSorts = useSetRecoilScopedStateV2(
    availableSortsScopedState,
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

  const setAvailableFilters = useSetRecoilScopedStateV2(
    availableFiltersScopedState,
    scopeId,
  );

  // ViewFields
  const setAvailableFields = useSetRecoilScopedStateV2(
    availableFieldsScopedState,
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

  return {
    currentViewId,
    setCurrentViewId,
    setIsViewBarExpanded,

    setViews,
    setViewEditMode,
    setViewObjectId,
    setViewType,
    setEntityCountInCurrentView,

    setAvailableSorts,
    setCurrentViewSorts,
    setSavedViewSorts,

    setAvailableFilters,
    setCurrentViewFilters,
    setSavedViewFilters,

    setAvailableFields,
    setCurrentViewFields,
    setSavedViewFields,
  };
};
