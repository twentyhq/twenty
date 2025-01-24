import { isSortDirectionMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isSortDirectionMenuUnfoldedState';
import { selectedSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedSortDirectionState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useResetSortDropdown = () => {
  const setIsSortDirectionMenuUnfolded = useSetRecoilComponentStateV2(
    isSortDirectionMenuUnfoldedComponentState,
  );

  const setSelectedSortDirection = useSetRecoilComponentStateV2(
    selectedSortDirectionComponentState,
  );

  const resetSortDropdown = () => {
    setIsSortDirectionMenuUnfolded(false);
    setSelectedSortDirection('asc');
  };

  return {
    resetSortDropdown,
  };
};
