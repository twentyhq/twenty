import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { sortsScopedState } from '../../ui/data/sort/states/sortsScopedState';
import { currentViewIdScopedState } from '../states/currentViewIdScopedState';

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
