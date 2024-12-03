import { useEffect } from 'react';
import {
  IconChevronLeft,
  IconHandMove,
  IconSortAZ,
  IconSortZA,
  MenuItem,
} from 'twenty-ui';

import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const ObjectOptionsDropdownRecordGroupSortContent = () => {
  const { currentContentId, onContentChange, closeDropdown } =
    useOptionsDropdown();

  const hiddenRecordGroupIds = useRecoilComponentValueV2(
    hiddenRecordGroupIdsComponentSelector,
  );

  const setRecordGroupSort = useSetRecoilComponentStateV2(
    recordIndexRecordGroupSortComponentState,
  );

  const handleRecordGroupSortChange = (sort: RecordGroupSort) => {
    setRecordGroupSort(sort);
    closeDropdown();
  };

  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroupIds.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroupIds, currentContentId, onContentChange]);

  return (
    <>
      <DropdownMenuHeader
        StartIcon={IconChevronLeft}
        onClick={() => onContentChange('recordGroups')}
      >
        Sort
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItem
          onClick={() => handleRecordGroupSortChange(RecordGroupSort.Manual)}
          LeftIcon={IconHandMove}
          text={RecordGroupSort.Manual}
        />
        <MenuItem
          onClick={() =>
            handleRecordGroupSortChange(RecordGroupSort.Alphabetical)
          }
          LeftIcon={IconSortAZ}
          text={RecordGroupSort.Alphabetical}
        />
        <MenuItem
          onClick={() =>
            handleRecordGroupSortChange(RecordGroupSort.ReverseAlphabetical)
          }
          LeftIcon={IconSortZA}
          text={RecordGroupSort.ReverseAlphabetical}
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
