import { useCalendarEventTargetObjectMetadataItems } from '@/activities/calendar/hooks/useCalendarEventTargetObjectMetadataItems';
import { useOpenCalendarEventTargetsPicker } from '@/activities/calendar/hooks/useOpenCalendarEventTargetsPicker';
import { type CalendarEventComposerTarget } from '@/activities/calendar/types/CalendarEventComposerTarget';
import { RecordChip } from '@/object-record/components/RecordChip';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledClickableContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 24px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledPlaceholder = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
`;

type CalendarEventComposerTargetsInputProps = {
  targets: CalendarEventComposerTarget[];
  onTargetChange: (morphItem: RecordPickerPickableMorphItem) => void;
};

export const CalendarEventComposerTargetsInput = ({
  targets,
  onTargetChange,
}: CalendarEventComposerTargetsInputProps) => {
  const componentId = useId();
  const dropdownId = `calendar-event-composer-targets-${componentId}`;

  const { closeDropdown } = useCloseDropdown();
  const { openCalendarEventTargetsPicker } =
    useOpenCalendarEventTargetsPicker();

  const searchableObjectMetadataItems =
    useCalendarEventTargetObjectMetadataItems();

  if (searchableObjectMetadataItems.length === 0) {
    return null;
  }

  const handleOpenDropdown = () => {
    openCalendarEventTargetsPicker({
      pickerInstanceId: dropdownId,
      searchableObjectMetadataItems,
      targets,
    });
  };

  const chips = targets
    .map((target) => {
      const objectMetadataItem = searchableObjectMetadataItems.find(
        ({ id }) => id === target.objectMetadataId,
      );

      if (!isDefined(objectMetadataItem)) {
        return null;
      }

      return (
        <RecordChip
          key={target.recordId}
          record={target.record}
          objectNameSingular={objectMetadataItem.nameSingular}
          forceDisableClick
        />
      );
    })
    .filter(isDefined);

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponentWidth="100%"
      onOpen={handleOpenDropdown}
      clickableComponent={
        <StyledClickableContainer>
          {chips.length > 0 ? (
            <ExpandableList isChipCountDisplayed>{chips}</ExpandableList>
          ) : (
            <StyledPlaceholder>{t`Add a related record`}</StyledPlaceholder>
          )}
        </StyledClickableContainer>
      }
      dropdownComponents={
        <MultipleRecordPicker
          componentInstanceId={dropdownId}
          focusId={dropdownId}
          onChange={onTargetChange}
          onSubmit={() => closeDropdown(dropdownId)}
          onClickOutside={() => closeDropdown(dropdownId)}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
      }
    />
  );
};
