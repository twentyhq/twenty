import { ListItemButton } from 'twenty-ui/components/navigation';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { RECORD_GROUP_SORT_LABELS } from '@/object-record/record-group/constants/RecordGroupSortLabels';
import { hiddenRecordGroupIdsComponentSelector } from '@/object-record/record-group/states/selectors/hiddenRecordGroupIdsComponentSelector';
import { RecordGroupSort } from '@/object-record/record-group/types/RecordGroupSort';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordGroupSortComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupSortComponentState';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconHandMove,
  IconSortAZ,
  IconSortZA,
} from 'twenty-ui/icon';

export const ObjectOptionsDropdownRecordGroupSortContent = () => {
  const { currentContentId, onContentChange, dropdownId } =
    useObjectOptionsDropdown();

  const hiddenRecordGroupIds = useAtomComponentSelectorValue(
    hiddenRecordGroupIdsComponentSelector,
  );

  const [recordIndexRecordGroupSort, setRecordIndexRecordGroupSort] =
    useAtomComponentState(recordIndexRecordGroupSortComponentState);

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const isRelationGroupBy =
    isDefined(recordIndexGroupFieldMetadataItem) &&
    isManyToOneRelationField(recordIndexGroupFieldMetadataItem);

  const handleRecordGroupSortChange = (sort: RecordGroupSort) => {
    setRecordIndexRecordGroupSort(sort);
  };

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  useEffect(() => {
    if (
      currentContentId === 'hiddenRecordGroups' &&
      hiddenRecordGroupIds.length === 0
    ) {
      onContentChange('recordGroups');
    }
  }, [hiddenRecordGroupIds, currentContentId, onContentChange]);

  const selectableItemIdArray = isRelationGroupBy
    ? [RecordGroupSort.Manual]
    : [
        RecordGroupSort.Manual,
        RecordGroupSort.Alphabetical,
        RecordGroupSort.ReverseAlphabetical,
      ];

  return (
    <LegacyDropdownContent>
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
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId={RecordGroupSort.Manual}
            onEnter={() => handleRecordGroupSortChange(RecordGroupSort.Manual)}
          >
            <ListItemButton
              onClick={() =>
                handleRecordGroupSortChange(RecordGroupSort.Manual)
              }
              focused={selectedItemId === RecordGroupSort.Manual}
              role="option"
              aria-selected={
                recordIndexRecordGroupSort === RecordGroupSort.Manual
              }
              selected={recordIndexRecordGroupSort === RecordGroupSort.Manual}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={IconHandMove} />}
            >
              {t(RECORD_GROUP_SORT_LABELS[RecordGroupSort.Manual])}
            </ListItemButton>
          </SelectableListItem>
          {!isRelationGroupBy && (
            <>
              <SelectableListItem
                itemId={RecordGroupSort.Alphabetical}
                onEnter={() =>
                  handleRecordGroupSortChange(RecordGroupSort.Alphabetical)
                }
              >
                <ListItemButton
                  onClick={() =>
                    handleRecordGroupSortChange(RecordGroupSort.Alphabetical)
                  }
                  focused={selectedItemId === RecordGroupSort.Alphabetical}
                  role="option"
                  aria-selected={
                    recordIndexRecordGroupSort === RecordGroupSort.Alphabetical
                  }
                  selected={
                    recordIndexRecordGroupSort === RecordGroupSort.Alphabetical
                  }
                  indicator="check"
                  startIcon={<SelectOptionIcon Icon={IconSortAZ} />}
                >
                  {t(RECORD_GROUP_SORT_LABELS[RecordGroupSort.Alphabetical])}
                </ListItemButton>
              </SelectableListItem>
              <SelectableListItem
                itemId={RecordGroupSort.ReverseAlphabetical}
                onEnter={() =>
                  handleRecordGroupSortChange(
                    RecordGroupSort.ReverseAlphabetical,
                  )
                }
              >
                <ListItemButton
                  onClick={() =>
                    handleRecordGroupSortChange(
                      RecordGroupSort.ReverseAlphabetical,
                    )
                  }
                  focused={
                    selectedItemId === RecordGroupSort.ReverseAlphabetical
                  }
                  role="option"
                  aria-selected={
                    recordIndexRecordGroupSort ===
                    RecordGroupSort.ReverseAlphabetical
                  }
                  selected={
                    recordIndexRecordGroupSort ===
                    RecordGroupSort.ReverseAlphabetical
                  }
                  indicator="check"
                  startIcon={<SelectOptionIcon Icon={IconSortZA} />}
                >
                  {t(
                    RECORD_GROUP_SORT_LABELS[
                      RecordGroupSort.ReverseAlphabetical
                    ],
                  )}
                </ListItemButton>
              </SelectableListItem>
            </>
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
