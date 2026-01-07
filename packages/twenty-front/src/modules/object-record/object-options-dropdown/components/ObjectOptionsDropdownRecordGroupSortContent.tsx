import { useEffect } from 'react';

import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import {
  IconChevronLeft,
  IconHandMove,
  IconSortAZ,
  IconSortZA,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownRecordGroupSortContent = () => {
  const { currentContentId, onContentChange } = useObjectOptionsDropdown();

  const hiddenRecordGroupIds = useRecoilComponentValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const [recordGroupSort, setRecordGroupSort] = useRecoilComponentState(
    recordIndexRecordGroupSortComponentState,
  );

  const handleRecordGroupSortChange = (sort: RecordGroupSort) => {
    setRecordGroupSort(sort);
  };

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroupIds.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroupIds, currentContentId, onContentChange]);

  const selectableItemIdArray = [
    RecordGroupSort.Manual,
    RecordGroupSort.Alphabetical,
    RecordGroupSort.ReverseAlphabetical,
  ];

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => onContentChange('recordGroups')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Sort`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
          focusId={OBJECT_OPTIONS_DROPDOWN_ID}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId={RecordGroupSort.Manual}
            onEnter={() => handleRecordGroupSortChange(RecordGroupSort.Manual)}
          >
            <MenuItemSelect
              onClick={() =>
                handleRecordGroupSortChange(RecordGroupSort.Manual)
              }
              LeftIcon={IconHandMove}
              text={RecordGroupSort.Manual}
              selected={recordGroupSort === RecordGroupSort.Manual}
              focused={selectedItemId === RecordGroupSort.Manual}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={RecordGroupSort.Alphabetical}
            onEnter={() =>
              handleRecordGroupSortChange(RecordGroupSort.Alphabetical)
            }
          >
            <MenuItemSelect
              onClick={() =>
                handleRecordGroupSortChange(RecordGroupSort.Alphabetical)
              }
              LeftIcon={IconSortAZ}
              text={RecordGroupSort.Alphabetical}
              selected={recordGroupSort === RecordGroupSort.Alphabetical}
              focused={selectedItemId === RecordGroupSort.Alphabetical}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={RecordGroupSort.ReverseAlphabetical}
            onEnter={() =>
              handleRecordGroupSortChange(RecordGroupSort.ReverseAlphabetical)
            }
          >
            <MenuItemSelect
              onClick={() =>
                handleRecordGroupSortChange(RecordGroupSort.ReverseAlphabetical)
              }
              LeftIcon={IconSortZA}
              text={RecordGroupSort.ReverseAlphabetical}
              selected={recordGroupSort === RecordGroupSort.ReverseAlphabetical}
              focused={selectedItemId === RecordGroupSort.ReverseAlphabetical}
            />
          </SelectableListItem>
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
