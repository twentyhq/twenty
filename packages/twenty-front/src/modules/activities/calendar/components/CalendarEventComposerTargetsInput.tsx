import { useCalendarEventTargetObjectMetadataItems } from '@/activities/calendar/hooks/useCalendarEventTargetObjectMetadataItems';
import { useOpenCalendarEventTargetsPicker } from '@/activities/calendar/hooks/useOpenCalendarEventTargetsPicker';
import { type CalendarEventComposerTarget } from '@/activities/calendar/types/CalendarEventComposerTarget';
import { RecordChip } from '@/object-record/components/RecordChip';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { IconButton } from 'twenty-ui/components/input';
import { OverflowingList } from 'twenty-ui/components/layout';
import { Dropdown } from 'twenty-ui/components/navigation';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type MouseEvent, useId, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledClickableContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 24px;
  min-width: 0;
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

  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);
  const { toggleDropdown } = useToggleDropdown();
  const { openCalendarEventTargetsPicker } =
    useOpenCalendarEventTargetsPicker();

  const searchableObjectMetadataItems =
    useCalendarEventTargetObjectMetadataItems();

  if (searchableObjectMetadataItems.length === 0) {
    return null;
  }

  const handleToggleDropdown = (event: MouseEvent) => {
    const isButtonClick =
      event.target instanceof Element &&
      isDefined(event.target.closest('button'));

    if (isButtonClick || event.defaultPrevented) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    toggleDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };

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
  const hasChips = isNonEmptyArray(chips);
  const pickerLabel = t`Add a related record`;

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      multiple
      onOpenChange={(open) => {
        if (open) {
          handleOpenDropdown();
        }
      }}
    >
      <StyledClickableContainer
        ref={setContainerElement}
        onClick={handleToggleDropdown}
      >
        {hasChips ? (
          <>
            <OverflowingList
              overflowLabel={t`Show all items`}
              showOverflowCount
            >
              {chips}
            </OverflowingList>
            <Dropdown.Trigger
              render={
                <IconButton
                  type="button"
                  size="sm"
                  variant="ghost"
                  aria-label={pickerLabel}
                >
                  <IconPlus />
                </IconButton>
              }
            />
          </>
        ) : (
          <Dropdown.Trigger
            render={
              <Button type="button" size="sm" variant="ghost">
                <StyledPlaceholder>{pickerLabel}</StyledPlaceholder>
              </Button>
            }
          />
        )}
      </StyledClickableContainer>
      <DropdownContent
        anchor={containerElement}
        side="bottom"
        align="start"
        width={GenericDropdownContentWidth.ExtraLarge}
        aria-label={pickerLabel}
      >
        <MultipleRecordPicker
          componentInstanceId={dropdownId}
          onChange={onTargetChange}
          layoutDirection="search-bar-on-bottom"
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
