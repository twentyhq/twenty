import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar, IconChevronLeft } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownCalendarDateFieldsContent = () => {
  const { t } = useLingui();

  const { objectMetadataItem, resetContent, onContentChange } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  if (!isDefined(currentView)) {
    return null;
  }

  const calendarFieldMetadata = objectMetadataItem.fields.find(
    (field) => field.id === currentView.calendarFieldMetadataId,
  );

  const calendarEndFieldMetadata = objectMetadataItem.fields.find(
    (field) => field.id === currentView.calendarEndFieldMetadataId,
  );

  const selectableItemIdArray = ['CalendarDateField', 'CalendarEndDateField'];

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => resetContent()}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Date fields`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer scrollable={false}>
        <SelectableList
          selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
          focusId={OBJECT_OPTIONS_DROPDOWN_ID}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId="CalendarDateField"
            onEnter={() => onContentChange('calendarFields')}
          >
            <MenuItem
              focused={selectedItemId === 'CalendarDateField'}
              onClick={() => onContentChange('calendarFields')}
              LeftIcon={IconCalendar}
              text={t`Date field`}
              contextualText={calendarFieldMetadata?.label}
              contextualTextPosition="right"
              hasSubMenu
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="CalendarEndDateField"
            onEnter={() => onContentChange('calendarEndFields')}
          >
            <MenuItem
              focused={selectedItemId === 'CalendarEndDateField'}
              onClick={() => onContentChange('calendarEndFields')}
              LeftIcon={IconCalendar}
              text={t`End date field`}
              contextualText={calendarEndFieldMetadata?.label ?? t`None`}
              contextualTextPosition="right"
              hasSubMenu
            />
          </SelectableListItem>
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
