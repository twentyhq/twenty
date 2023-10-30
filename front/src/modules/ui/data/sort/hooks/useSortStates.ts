import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableSortDefinitionsScopedState } from '../states/availableSortDefinitionsScopedState';
import { isSortSelectedScopedState } from '../states/isSortSelectedScopedState';

export const useSortStates = (scopeId: string) => {
  const [availableSortDefinitions, setAvailableSortDefinitions] =
    useRecoilScopedStateV2(availableSortDefinitionsScopedState, scopeId);

  const [isSortSelected, setIsSortSelected] = useRecoilScopedStateV2(
    isSortSelectedScopedState,
    scopeId,
  );

  return {
    availableSortDefinitions,
    setAvailableSortDefinitions,
    isSortSelected,
    setIsSortSelected,
  };
};
