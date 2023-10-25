import { useRecoilValue } from 'recoil';

import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableViewFieldsScopedFamilyState } from '../states/availableViewFieldsScopedFamilyState';
import { availableViewFiltersScopedState } from '../states/availableViewFiltersScopedState';
import { availableViewSortsScopedState } from '../states/availableViewSortsScopedState';
import { currentViewFieldsScopedFamilyState } from '../states/currentViewFieldsScopedFamilyState';
import { currentViewFiltersScopedFamilyState } from '../states/currentViewFiltersScopedFamilyState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { currentViewSortsScopedFamilyState } from '../states/currentViewSortsScopedFamilyState';
import { onViewFieldsChangeScopedState } from '../states/onViewFieldsChangeScopedState';
import { onViewFiltersChangeScopedState } from '../states/onViewFiltersChangeScopedState';
import { onViewSortsChangeScopedState } from '../states/onViewSortsChangeScopedState';
import { savedViewFiltersScopedFamilyState } from '../states/savedViewFiltersScopedFamilyState';
import { savedViewSortsScopedFamilyState } from '../states/savedViewSortsScopedFamilyState';
import { currentViewFieldByKeyScopedFamilySelector } from '../states/selectors/currentViewFieldByKeyScopedFamilySelector';
import { savedViewFiltersByKeyScopedFamilySelector } from '../states/selectors/savedViewFiltersByKeyScopedFamilySelector';
import { savedViewSortsByKeyScopedFamilySelector } from '../states/selectors/savedViewSortsByKeyScopedFamilySelector';
import { viewEditModeScopedState } from '../states/viewEditModeScopedState';
import { viewObjectIdScopeState } from '../states/viewObjectIdScopeState';
import { viewsScopedState } from '../states/viewsScopedState';
import { viewTypeScopedState } from '../states/viewTypeScopedState';

export const useViewStates = (scopeId: string) => {
  const [currentViewId, setCurrentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    scopeId,
  );

  // View
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

  // ViewSorts
  const [currentViewSorts, setCurrentViewSorts] = useRecoilScopedFamilyState(
    currentViewSortsScopedFamilyState,
    scopeId,
    currentViewId,
  );

  const [savedViewSorts, setSavedViewSorts] = useRecoilScopedFamilyState(
    savedViewSortsScopedFamilyState,
    scopeId,
    currentViewId,
  );

  const savedViewSortsByKey = useRecoilValue(
    savedViewSortsByKeyScopedFamilySelector({ scopeId, viewId: currentViewId }),
  );

  const [availableViewSorts, setAvailableViewSorts] =
    useRecoilScopedFamilyState(
      availableViewSortsScopedState,
      scopeId,
      currentViewId,
    );

  // ViewFilters
  const [currentViewFilters, setCurrentViewFilters] =
    useRecoilScopedFamilyState(
      currentViewFiltersScopedFamilyState,
      scopeId,
      currentViewId,
    );

  const [savedViewFilters, setSavedViewFilters] = useRecoilScopedFamilyState(
    savedViewFiltersScopedFamilyState,
    scopeId,
    currentViewId,
  );

  const savedViewFiltersByKey = useRecoilValue(
    savedViewFiltersByKeyScopedFamilySelector({
      scopeId,
      viewId: currentViewId,
    }),
  );

  const [availableViewFilters, setAvailableViewFilters] =
    useRecoilScopedFamilyState(
      availableViewFiltersScopedState,
      scopeId,
      currentViewId,
    );

  // ViewFields
  const [availableViewFields, setAvailableViewFields] =
    useRecoilScopedFamilyState(
      availableViewFieldsScopedFamilyState,
      scopeId,
      currentViewId,
    );

  const [currentViewFields, setCurrentViewFields] = useRecoilScopedFamilyState(
    currentViewFieldsScopedFamilyState,
    scopeId,
    currentViewId,
  );

  const currentViewFieldsByKey = useRecoilValue(
    currentViewFieldByKeyScopedFamilySelector({
      scopeId,
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
    setCurrentViewId,

    views,
    setViews,
    viewEditMode,
    setViewEditMode,
    viewObjectId,
    setViewObjectId,
    viewType,
    setViewType,

    availableViewSorts,
    setAvailableViewSorts,
    currentViewSorts,
    setCurrentViewSorts,
    savedViewSorts,
    savedViewSortsByKey,
    setSavedViewSorts,

    availableViewFilters,
    setAvailableViewFilters,
    currentViewFilters,
    setCurrentViewFilters,
    savedViewFilters,
    savedViewFiltersByKey,
    setSavedViewFilters,

    availableViewFields,
    setAvailableViewFields,
    currentViewFields,
    currentViewFieldsByKey,
    setCurrentViewFields,

    onViewSortsChange,
    setOnViewSortsChange,
    onViewFiltersChange,
    setOnViewFiltersChange,
    onViewFieldsChange,
    setOnViewFieldsChange,
  };
};
