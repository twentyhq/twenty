import { isRecordSortDirectionDropdownMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isRecordSortDirectionDropdownMenuUnfoldedComponentState';
import { selectedRecordSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedRecordSortDirectionComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const useResetSortDropdown = () => {
  const setIsRecordSortDirectionDropdownMenuUnfolded =
    useSetRecoilComponentState(
      isRecordSortDirectionDropdownMenuUnfoldedComponentState,
    );

  const setSelectedRecordSortDirection = useSetRecoilComponentState(
    selectedRecordSortDirectionComponentState,
  );

  const resetSortDropdown = () => {
    setIsRecordSortDirectionDropdownMenuUnfolded(false);
    setSelectedRecordSortDirection('asc');
  };

  return {
    resetSortDropdown,
  };
};
