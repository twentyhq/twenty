import { useEffect } from 'react';

import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import {
  IconChevronLeft,
  IconHandMove,
  IconSortAZ,
  IconSortZA,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownRecordGroupSortContent = () => {
  const { currentContentId, onContentChange } = useOptionsDropdown();

  const hiddenRecordGroupIds = useRecoilComponentValueV2(
    hiddenRecordGroupIdsComponentSelector,
  );

  const [recordGroupSort, setRecordGroupSort] = useRecoilComponentStateV2(
    recordIndexRecordGroupSortComponentState,
  );

  const handleRecordGroupSortChange = (sort: RecordGroupSort) => {
    setRecordGroupSort(sort);
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
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => onContentChange('recordGroups')}
            Icon={IconChevronLeft}
          />
        }
      >
        Sort
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          onClick={() => handleRecordGroupSortChange(RecordGroupSort.Manual)}
          LeftIcon={IconHandMove}
          text={RecordGroupSort.Manual}
          selected={recordGroupSort === RecordGroupSort.Manual}
        />
        <MenuItemSelect
          onClick={() =>
            handleRecordGroupSortChange(RecordGroupSort.Alphabetical)
          }
          LeftIcon={IconSortAZ}
          text={RecordGroupSort.Alphabetical}
          selected={recordGroupSort === RecordGroupSort.Alphabetical}
        />
        <MenuItemSelect
          onClick={() =>
            handleRecordGroupSortChange(RecordGroupSort.ReverseAlphabetical)
          }
          LeftIcon={IconSortZA}
          text={RecordGroupSort.ReverseAlphabetical}
          selected={recordGroupSort === RecordGroupSort.ReverseAlphabetical}
        />
      </DropdownMenuItemsContainer>
    </>
  );
};
