import { isRecordSortDirectionMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isRecordSortDirectionMenuUnfoldedComponentState';
import { selectedRecordSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedRecordSortDirectionComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const useResetSortDropdown = () => {
  const setIsRecordSortDirectionMenuUnfolded = useSetRecoilComponentStateV2(
    isRecordSortDirectionMenuUnfoldedComponentState,
  );

  const setSelectedRecordSortDirection = useSetRecoilComponentStateV2(
    selectedRecordSortDirectionComponentState,
  );

  const resetSortDropdown = () => {
    setIsRecordSortDirectionMenuUnfolded(false);
    setSelectedRecordSortDirection('asc');
  };

  return {
    resetSortDropdown,
  };
};
