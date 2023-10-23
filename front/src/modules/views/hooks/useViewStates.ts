import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { currentViewIdScopedState } from '../states/currentViewIdScopedState';

export const useViewStates = ({ scopeId }: { scopeId: string }) => {
  const [currentViewId, setCurrentViewId] = useRecoilScopedStateV2(
    currentViewIdScopedState,
    scopeId,
  );

  return {
    currentViewId,
    setCurrentViewId,
  };
};
