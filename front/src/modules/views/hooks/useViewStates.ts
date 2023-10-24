import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableSortsScopedState } from '../states/availableSortsScopedState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';

export const useViewStates = ({ scopeId }: { scopeId: string }) => {
  const [currentViewId, setCurrentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    scopeId,
  );

  const [availableSorts, setAvailableSorts] = useRecoilScopedStateV2(
    availableSortsScopedState,
    scopeId,
  );

  if (!availableSorts) {
    throw new Error('availableSorts is undefined');
  }

  return {
    currentViewId,
    setCurrentViewId,
    availableSorts,
    setAvailableSorts,
  };
};
