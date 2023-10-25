import { useRecoilScopedFamilyState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedFamilyState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { savedSortsScopedFamilyState } from '../states/savedSortsScopedFamilyState';
import { sortsScopedFamilyState } from '../states/sortsScopedFamilyState';

export const useViewStates = (scopeId: string) => {
  const [currentViewId, setCurrentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    scopeId,
  );

  const [sorts, setSorts] = useRecoilScopedFamilyState(
    sortsScopedFamilyState,
    scopeId,
    currentViewId,
  );

  const [savedSorts, setSavedSorts] = useRecoilScopedFamilyState(
    savedSortsScopedFamilyState,
    scopeId,
    currentViewId,
  );

  const [availableSorts, setAvailableSorts] = useRecoilScopedFamilyState(
    availableSortsScopedState,
    scopeId,
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
