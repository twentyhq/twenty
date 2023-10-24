import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { availableSortsScopedState } from '@/views/states/availableSortsScopedState';

import { sortsScopedState } from '../states/sortsScopedState';

export const useSortStates = ({ scopeId }: { scopeId: string }) => {
  const [sorts, setSorts] = useRecoilScopedStateV2(sortsScopedState, scopeId);

  const [availableSorts, setAvailableSorts] = useRecoilScopedStateV2(
    availableSortsScopedState,
    scopeId,
  );

  if (!availableSorts) {
    throw new Error('availableSorts is undefined');
  }

  return {
    sorts,
    setSorts,
    availableSorts,
    setAvailableSorts,
  };
};
