import { onSortSelectScopedState } from '@/object-record/object-sort-dropdown/states/onSortSelectScopedState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';

import { availableSortDefinitionsScopedState } from '../states/availableSortDefinitionsScopedState';
import { isSortSelectedScopedState } from '../states/isSortSelectedScopedState';

export const useSortDropdownStates = (scopeId: string) => {
  const [availableSortDefinitions, setAvailableSortDefinitions] =
    useRecoilScopedStateV2(availableSortDefinitionsScopedState, scopeId);

  const [isSortSelected, setIsSortSelected] = useRecoilScopedStateV2(
    isSortSelectedScopedState,
    scopeId,
  );

  const [onSortSelect, setOnSortSelect] = useRecoilScopedStateV2(
    onSortSelectScopedState,
    scopeId,
  );

  return {
    availableSortDefinitions,
    setAvailableSortDefinitions,
    isSortSelected,
    setIsSortSelected,
    onSortSelect,
    setOnSortSelect,
  };
};
