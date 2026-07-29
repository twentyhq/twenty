import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
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
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { Fragment, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/icon';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const ObjectOptionsDropdownCalendarFieldsContent = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');
  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );

  const { objectMetadataItem, resetContent, onContentChange, closeDropdown } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();
  const { availableFieldsForCalendar, navigateToDateFieldSettings } =
    useGetAvailableFieldsForCalendar();

  const setRecordIndexCalendarFieldMetadataId = useSetAtomComponentState(
    recordIndexCalendarFieldMetadataIdComponentState,
  );
  const setRecordIndexCalendarEndFieldMetadataId = useSetAtomComponentState(
    recordIndexCalendarEndFieldMetadataIdComponentState,
  );

  const calendarFieldMetadata = currentView?.calendarFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarFieldMetadataId,
      )
    : undefined;

  const calendarEndFieldMetadata = currentView?.calendarEndFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarEndFieldMetadataId,
      )
    : undefined;

  const availableCalendarFields = isDefined(calendarEndFieldMetadata)
    ? availableFieldsForCalendar.filter(
        (field) => field.type === calendarEndFieldMetadata.type,
      )
    : availableFieldsForCalendar;

  const filteredCalendarFields = availableCalendarFields.filter((field) =>
    field.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const calendarFieldGroups = groupCalendarFieldMetadataItemsByType(
    filteredCalendarFields,
  );

  const handleBack = () => {
    if (isCalendarWeekViewEnabled) {
      onContentChange('calendarDateFields');
      return;
    }
    resetContent();
  };

  const handleCalendarFieldChange = async (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    const shouldClearCalendarEndField =
      isDefined(currentView?.calendarEndFieldMetadataId) &&
      (!isDefined(calendarEndFieldMetadata) ||
        calendarEndFieldMetadata.id === fieldMetadataItem.id ||
        calendarEndFieldMetadata.type !== fieldMetadataItem.type);

    setRecordIndexCalendarFieldMetadataId(fieldMetadataItem.id);
    if (shouldClearCalendarEndField) {
      setRecordIndexCalendarEndFieldMetadataId(null);
    }

    await updateCurrentView({
      calendarFieldMetadataId: fieldMetadataItem.id,
      ...(shouldClearCalendarEndField
        ? { calendarEndFieldMetadataId: null }
        : {}),
    });
    closeDropdown();
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleBack}
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
        {calendarFieldGroups.map((group) => (
          <Fragment key={group.label}>
            <DropdownMenuSectionLabel label={group.label} />
            {group.fields.map((fieldMetadataItem) => (
              <MenuItemSelect
                key={fieldMetadataItem.id}
                selected={fieldMetadataItem.id === calendarFieldMetadata?.id}
                onClick={() => handleCalendarFieldChange(fieldMetadataItem)}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                text={fieldMetadataItem.label}
              />
            ))}
          </Fragment>
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
