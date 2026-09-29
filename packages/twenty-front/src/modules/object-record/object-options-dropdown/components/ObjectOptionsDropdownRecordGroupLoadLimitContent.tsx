import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { recordIndexGroupLoadLimitComponentState } from '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { VIEW_GROUP_LOAD_LIMIT_OPTIONS } from 'twenty-shared/constants';
import { IconChevronLeft } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

export const ObjectOptionsDropdownRecordGroupLoadLimitContent = () => {
  const { onContentChange, dropdownId } = useObjectOptionsDropdown();

  const recordIndexGroupLoadLimit = useAtomComponentStateValue(
    recordIndexGroupLoadLimitComponentState,
  );

  const { handleGroupLoadLimitChange } = useRecordGroupVisibility();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  // SelectableList ids are strings, the limits are numbers
  const selectableItemIdArray = VIEW_GROUP_LOAD_LIMIT_OPTIONS.map(String);

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
        {t`Load limit`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
        >
          {VIEW_GROUP_LOAD_LIMIT_OPTIONS.map((loadLimitOption) => (
            <SelectableListItem
              key={loadLimitOption}
              itemId={String(loadLimitOption)}
              onEnter={() => handleGroupLoadLimitChange(loadLimitOption)}
            >
              <ListItem
                onClick={() => handleGroupLoadLimitChange(loadLimitOption)}
                focused={selectedItemId === String(loadLimitOption)}
                role="option"
                aria-selected={recordIndexGroupLoadLimit === loadLimitOption}
                selected={recordIndexGroupLoadLimit === loadLimitOption}
                indicator="check"
              >
                {String(loadLimitOption)}
              </ListItem>
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
