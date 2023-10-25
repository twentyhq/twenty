import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { availableSortsScopedState } from '@/views/states/availableSortsScopedState';

import { isSortSelectedScopedState } from '../states/isSortSelectedScopedState';

export const useSortStates = (scopeId: string) => {
  const [availableSorts, setAvailableSorts] = useRecoilScopedStateV2(
    availableSortsScopedState,
    scopeId,
  );

  const [isSortSelected, setIsSortSelected] = useRecoilScopedStateV2(
    isSortSelectedScopedState,
    scopeId,
  );

  return {
    availableSorts,
    setAvailableSorts,
    isSortSelected,
    setIsSortSelected,
  };
};
