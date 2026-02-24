import { isRecordSortDirectionDropdownMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isRecordSortDirectionDropdownMenuUnfoldedComponentState';
import { selectedRecordSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedRecordSortDirectionComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { ViewSortDirection } from '~/generated-metadata/graphql';

export const useResetSortDropdown = () => {
  const setIsRecordSortDirectionDropdownMenuUnfolded =
    useSetRecoilComponentStateV2(
      isRecordSortDirectionDropdownMenuUnfoldedComponentState,
    );

  const setSelectedRecordSortDirection = useSetRecoilComponentStateV2(
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
