import { isRecordSortDirectionDropdownMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isRecordSortDirectionDropdownMenuUnfoldedComponentState';
import { selectedRecordSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedRecordSortDirectionComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ViewSortDirection } from '~/generated/graphql';

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
    setSelectedRecordSortDirection(ViewSortDirection.ASC);
  };

  return {
    resetSortDropdown,
  };
};
