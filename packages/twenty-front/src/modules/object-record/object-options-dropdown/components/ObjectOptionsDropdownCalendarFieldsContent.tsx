import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/icon';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownCalendarFieldsContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItem, resetContent, closeDropdown } =
    useObjectOptionsDropdown();

  const { updateCurrentView } = useUpdateCurrentView();
  const { availableFieldsForCalendar, navigateToDateFieldSettings } =
    useGetAvailableFieldsForCalendar();

  const [
    recordIndexCalendarFieldMetadataId,
    setRecordIndexCalendarFieldMetadataId,
  ] = useAtomComponentState(recordIndexCalendarFieldMetadataIdComponentState);

  const calendarFieldMetadata = recordIndexCalendarFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === recordIndexCalendarFieldMetadataId,
      )
    : undefined;

  const filteredCalendarFields = availableFieldsForCalendar.filter((field) =>
    field.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const handleCalendarFieldChange = async (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    setRecordIndexCalendarFieldMetadataId(fieldMetadataItem.id);

    try {
      await updateCurrentView({
        calendarFieldMetadataId: fieldMetadataItem.id,
        calendarEndFieldMetadataId: null,
      });
    } catch (error) {
      setRecordIndexCalendarFieldMetadataId(recordIndexCalendarFieldMetadataId);
      throw error;
    }
    closeDropdown();
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Date field`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {filteredCalendarFields.map((fieldMetadataItem) => (
          <MenuItemSelect
            key={fieldMetadataItem.id}
            selected={fieldMetadataItem.id === calendarFieldMetadata?.id}
            onClick={() => handleCalendarFieldChange(fieldMetadataItem)}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            text={fieldMetadataItem.label}
          />
        ))}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <MenuItem
          LeftIcon={IconSettings}
          text={t`Create date field`}
          onClick={() => {
            navigateToDateFieldSettings();
            closeDropdown();
          }}
        />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
