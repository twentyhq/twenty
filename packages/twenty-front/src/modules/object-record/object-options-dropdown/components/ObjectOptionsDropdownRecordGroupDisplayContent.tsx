import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useUpdateRecordGroupDisplay } from '@/object-record/record-group/hooks/useUpdateRecordGroupDisplay';
import { recordIndexShouldDisplayGroupsAsTabsComponentState } from '@/object-record/record-index/states/recordIndexShouldDisplayGroupsAsTabsComponentState';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { ListItemButton } from 'twenty-ui/components/navigation';
import {
  IconChevronLeft,
  IconLayoutList,
  IconLayoutNavbar,
} from 'twenty-ui/icon';

const SECTIONS_ITEM_ID = doNotTranslate('Sections');
const TABS_ITEM_ID = doNotTranslate('Tabs');

export const ObjectOptionsDropdownRecordGroupDisplayContent = () => {
  const { t } = useLingui();

  const { onContentChange, dropdownId, recordIndexId } =
    useObjectOptionsDropdown();

  const recordIndexShouldDisplayGroupsAsTabs = useAtomComponentStateValue(
    recordIndexShouldDisplayGroupsAsTabsComponentState,
  );

  const { updateRecordGroupDisplay } =
    useUpdateRecordGroupDisplay(recordIndexId);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

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
        {t`Display`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={[SECTIONS_ITEM_ID, TABS_ITEM_ID]}
        >
          <SelectableListItem
            itemId={SECTIONS_ITEM_ID}
            onEnter={() => updateRecordGroupDisplay(false)}
          >
            <ListItemButton
              onClick={() => updateRecordGroupDisplay(false)}
              focused={selectedItemId === SECTIONS_ITEM_ID}
              role="option"
              aria-selected={!recordIndexShouldDisplayGroupsAsTabs}
              selected={!recordIndexShouldDisplayGroupsAsTabs}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={IconLayoutList} />}
            >{t`Sections`}</ListItemButton>
          </SelectableListItem>
          <SelectableListItem
            itemId={TABS_ITEM_ID}
            onEnter={() => updateRecordGroupDisplay(true)}
          >
            <ListItemButton
              onClick={() => updateRecordGroupDisplay(true)}
              focused={selectedItemId === TABS_ITEM_ID}
              role="option"
              aria-selected={recordIndexShouldDisplayGroupsAsTabs}
              selected={recordIndexShouldDisplayGroupsAsTabs}
              indicator="check"
              startIcon={<SelectOptionIcon Icon={IconLayoutNavbar} />}
            >{t`Tabs`}</ListItemButton>
          </SelectableListItem>
        </SelectableList>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
