import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { recordIndexCalendarEndFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarEndFieldMetadataIdComponentState';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { groupCalendarFieldMetadataItemsByType } from '@/object-record/record-calendar/utils/groupCalendarFieldMetadataItemsByType';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { getAvailableCalendarEndFieldMetadataItems } from '@/views/view-picker/utils/getAvailableCalendarEndFieldMetadataItems';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const ObjectOptionsDropdownCalendarEndFieldsContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');
  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );

  const { onContentChange, closeDropdown } = useObjectOptionsDropdown();

  const { updateCurrentView } = useUpdateCurrentView();
  const { availableFieldsForCalendar } = useGetAvailableFieldsForCalendar();

  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );
  const [
    recordIndexCalendarEndFieldMetadataId,
    setRecordIndexCalendarEndFieldMetadataId,
  ] = useAtomComponentState(
    recordIndexCalendarEndFieldMetadataIdComponentState,
  );

  const availableCalendarEndFieldMetadataItems =
    getAvailableCalendarEndFieldMetadataItems({
      availableFieldsForCalendar,
      calendarFieldMetadataId: recordIndexCalendarFieldMetadataId,
    });

  const filteredCalendarEndFields =
    availableCalendarEndFieldMetadataItems.filter((field) =>
      field.label.toLowerCase().includes(searchInput.toLowerCase()),
    );

  const calendarEndFieldGroups = groupCalendarFieldMetadataItemsByType(
    filteredCalendarEndFields,
  );

  const handleCalendarEndFieldChange = async (
    fieldMetadataItem: FieldMetadataItem | null,
  ) => {
    if (!isCalendarWeekViewEnabled) {
      return;
    }

    const calendarEndFieldMetadataId = fieldMetadataItem?.id ?? null;

    setRecordIndexCalendarEndFieldMetadataId(calendarEndFieldMetadataId);
    try {
      await updateCurrentView({ calendarEndFieldMetadataId });
    } catch (error) {
      setRecordIndexCalendarEndFieldMetadataId(
        recordIndexCalendarEndFieldMetadataId,
      );
      throw error;
    }
    closeDropdown();
  };

  if (!isCalendarWeekViewEnabled) {
    return null;
  }

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => onContentChange('calendarDateFields')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`End date field`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          selected={!isDefined(recordIndexCalendarEndFieldMetadataId)}
          onClick={() => handleCalendarEndFieldChange(null)}
          text={t`None`}
        />
        {calendarEndFieldGroups.map((group) => (
          <Fragment key={group.label}>
            <DropdownMenuSectionLabel label={group.label} />
            {group.fields.map((fieldMetadataItem) => (
              <MenuItemSelect
                key={fieldMetadataItem.id}
                selected={
                  fieldMetadataItem.id === recordIndexCalendarEndFieldMetadataId
                }
                onClick={() => handleCalendarEndFieldChange(fieldMetadataItem)}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                text={fieldMetadataItem.label}
              />
            ))}
          </Fragment>
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
