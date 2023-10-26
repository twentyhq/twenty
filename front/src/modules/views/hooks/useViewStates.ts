import { useRecoilValue } from 'recoil';

import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableFieldsScopedState } from '../states/availableFieldsScopedState';
import { availableFiltersScopedState } from '../states/availableFiltersScopedState';
import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { currentViewSortsScopedState } from '../states/currentViewSortsScopedState';
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
import { currentViewSortsOrderByScopedFamilySelector } from '../states/selectors/currentViewSortsOrderByScopedFamilySelector';
import { savedViewFieldByKeyScopedFamilySelector } from '../states/selectors/savedViewFieldByKeyScopedFamilySelector';
import { savedViewFiltersByKeyScopedFamilySelector } from '../states/selectors/savedViewFiltersByKeyScopedFamilySelector';
import { savedViewSortsByKeyScopedFamilySelector } from '../states/selectors/savedViewSortsByKeyScopedFamilySelector';
import { viewEditModeScopedState } from '../states/viewEditModeScopedState';
import { viewObjectIdScopeState } from '../states/viewObjectIdScopeState';
import { viewsScopedState } from '../states/viewsScopedState';
import { viewTypeScopedState } from '../states/viewTypeScopedState';

export const useViewStates = (scopeId: string) => {
  // View
  const [currentViewId, setCurrentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    scopeId,
  );

  const currentView = useRecoilValue(currentViewScopedSelector(scopeId));

  const [viewEditMode, setViewEditMode] = useRecoilScopedStateV2(
    viewEditModeScopedState,
    scopeId,
  );

  const [views, setViews] = useRecoilScopedStateV2(viewsScopedState, scopeId);

  const [viewObjectId, setViewObjectId] = useRecoilScopedStateV2(
    viewObjectIdScopeState,
    scopeId,
  );

  const [viewType, setViewType] = useRecoilScopedStateV2(
    viewTypeScopedState,
    scopeId,
  );

  const [entityCountInCurrentView, setEntityCountInCurrentView] =
    useRecoilScopedStateV2(entityCountInCurrentViewScopedState, scopeId);

  const [isViewBarExpanded, setIsViewBarExpanded] = useRecoilScopedStateV2(
    isViewBarExpandedScopedState,
    scopeId,
  );

  // ViewSorts
  const [currentViewSorts, setCurrentViewSorts] = useRecoilScopedStateV2(
    currentViewSortsScopedState,
    scopeId,
  );

  const [savedViewSorts, setSavedViewSorts] = useRecoilScopedFamilyState(
    savedViewSortsScopedFamilyState,
    scopeId,
    currentViewId || '',
  );

  const savedViewSortsByKey = useRecoilValue(
    savedViewSortsByKeyScopedFamilySelector({ scopeId, viewId: currentViewId }),
  );

  const [availableSorts, setAvailableSorts] = useRecoilScopedStateV2(
    availableSortsScopedState,
    scopeId,
  );

  const canPersistSorts = useRecoilValue(
    canPersistViewSortsScopedFamilySelector({
      viewScopeId: scopeId,
      viewId: currentViewId,
    }),
  );

  const currentViewSortsOrderBy = useRecoilValue(
    currentViewSortsOrderByScopedFamilySelector({
      viewScopeId: scopeId,
      viewId: currentViewId,
    }),
  );

  // ViewFilters
  const [currentViewFilters, setCurrentViewFilters] =
    useRecoilScopedFamilyState(
      currentViewFiltersScopedFamilyState,
      scopeId,
      currentViewId || '',
    );

  const [savedViewFilters, setSavedViewFilters] = useRecoilScopedFamilyState(
    savedViewFiltersScopedFamilyState,
    scopeId,
    currentViewId || '',
  );

  const savedViewFiltersByKey = useRecoilValue(
    savedViewFiltersByKeyScopedFamilySelector({
      scopeId,
      viewId: currentViewId,
    }),
  );

  const [availableFilters, setAvailableFilters] = useRecoilScopedStateV2(
    availableFiltersScopedState,
    scopeId,
  );

  const canPersistFilters = useRecoilValue(
    canPersistViewFiltersScopedFamilySelector({
      viewScopeId: scopeId,
      viewId: currentViewId,
    }),
  );

  // ViewFields
  const [availableFields, setAvailableFields] = useRecoilScopedStateV2(
    availableFieldsScopedState,
    scopeId,
  );

  const [currentViewFields, setCurrentViewFields] = useRecoilScopedFamilyState(
    currentViewFieldsScopedFamilyState,
    scopeId,
    currentViewId || '',
  );

  const [savedViewFields, setSavedViewFields] = useRecoilScopedFamilyState(
    savedViewFieldsScopedFamilyState,
    scopeId,
    currentViewId || '',
  );

  const savedViewFieldsByKey = useRecoilValue(
    savedViewFieldByKeyScopedFamilySelector({
      viewScopeId: scopeId,
      viewId: currentViewId,
    }),
  );

  // ViewChangeHandlers
  const [onViewSortsChange, setOnViewSortsChange] = useRecoilScopedStateV2(
    onViewSortsChangeScopedState,
    scopeId,
  );

  const [onViewFiltersChange, setOnViewFiltersChange] = useRecoilScopedStateV2(
    onViewFiltersChangeScopedState,
    scopeId,
  );

  const [onViewFieldsChange, setOnViewFieldsChange] = useRecoilScopedStateV2(
    onViewFieldsChangeScopedState,
    scopeId,
  );

  return {
    currentViewId,
    currentView,
    setCurrentViewId,
    isViewBarExpanded,
    setIsViewBarExpanded,

    views,
    setViews,
    viewEditMode,
    setViewEditMode,
    viewObjectId,
    setViewObjectId,
    viewType,
    setViewType,
    entityCountInCurrentView,
    setEntityCountInCurrentView,

    availableSorts,
    setAvailableSorts,
    currentViewSorts,
    setCurrentViewSorts,
    savedViewSorts,
    savedViewSortsByKey,
    setSavedViewSorts,
    canPersistSorts,
    currentViewSortsOrderBy,

    availableFilters,
    setAvailableFilters,
    currentViewFilters,
    setCurrentViewFilters,
    savedViewFilters,
    savedViewFiltersByKey,
    setSavedViewFilters,
    canPersistFilters,

    availableFields,
    setAvailableFields,
    currentViewFields,
    savedViewFieldsByKey,
    setCurrentViewFields,
    savedViewFields,
    setSavedViewFields,

    onViewSortsChange,
    setOnViewSortsChange,
    onViewFiltersChange,
    setOnViewFiltersChange,
    onViewFieldsChange,
    setOnViewFieldsChange,
  };
};
