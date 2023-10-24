import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { sortsScopedState } from '../states/sortsScopedState';

export const useSortStates = ({ scopeId }: { scopeId: string }) => {
  const [sorts, setSorts] = useRecoilScopedStateV2(sortsScopedState, scopeId);

  return {
    sorts,
    setSorts,
  };
};
