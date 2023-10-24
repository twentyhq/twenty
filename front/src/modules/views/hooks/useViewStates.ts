import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { currentViewIdScopedState } from '../states/currentViewIdScopedState';
import { sortsScopedState } from '../states/sortsScopedState';

export const useViewStates = ({ scopeId }: { scopeId: string }) => {
  const [currentViewId, setCurrentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    scopeId,
  );

  const [sorts, setSorts] = useRecoilScopedStateV2(sortsScopedState, scopeId);

  return {
    currentViewId,
    setCurrentViewId,
    sorts,
    setSorts,
  };
};
