import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { ViewScopeInternalContext } from '../scopes/scope-internal-context/ViewScopeInternalContext';
import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { savedSortsScopedFamilyState } from '../states/savedSortsScopedFamilyState';
import { sortsScopedFamilyState } from '../states/sortsScopedFamilyState';

export const useViewStates = (scopeId?: string) => {
  const viewScopeId = useAvailableScopeIdOrThrow(
    ViewScopeInternalContext,
    scopeId,
  );
  const [currentViewId, setCurrentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    viewScopeId,
  );

  const [sorts, setSorts] = useRecoilScopedFamilyState(
    sortsScopedFamilyState,
    viewScopeId,
    currentViewId,
  );

  const [savedSorts, setSavedSorts] = useRecoilScopedFamilyState(
    savedSortsScopedFamilyState,
    viewScopeId,
    currentViewId,
  );

  const [availableSorts, setAvailableSorts] = useRecoilScopedFamilyState(
    availableSortsScopedState,
    viewScopeId,
    currentViewId,
  );

  return {
    currentViewId,
    setCurrentViewId,
    availableSorts,
    setAvailableSorts,
    sorts,
    setSorts,
    savedSorts,
    setSavedSorts,
  };
};
