import { useCalendarEventTargetObjectMetadataItems } from '@/activities/calendar/hooks/useCalendarEventTargetObjectMetadataItems';
import { useOpenCalendarEventTargetsPicker } from '@/activities/calendar/hooks/useOpenCalendarEventTargetsPicker';
import { type CalendarEventComposerTarget } from '@/activities/calendar/types/CalendarEventComposerTarget';
import { RecordChip } from '@/object-record/components/RecordChip';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { IconButton } from 'twenty-ui/components/input';
import { OverflowingList } from 'twenty-ui/components/layout';
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
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const { closeDropdown } = useCloseDropdown();
  const { toggleDropdown } = useToggleDropdown();
  const { openCalendarEventTargetsPicker } =
    useOpenCalendarEventTargetsPicker();

  const searchableObjectMetadataItems =
    useCalendarEventTargetObjectMetadataItems();

  if (searchableObjectMetadataItems.length === 0) {
    return null;
  }

  const handleToggleDropdown = (event: MouseEvent) => {
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
  const pickerOptionsId = `${dropdownId}-options`;

  return (
    <>
      <StyledClickableContainer
        ref={setContainerElement}
        onClick={handleToggleDropdown}
        data-click-outside-id={dropdownId}
      >
        {hasChips ? (
          <>
            <OverflowingList
              overflowLabel={t`Show all items`}
              showOverflowCount
            >
              {chips}
            </OverflowingList>
            <IconButton
              type="button"
              size="sm"
              variant="ghost"
              aria-label={pickerLabel}
              aria-controls={pickerOptionsId}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <IconPlus />
            </IconButton>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-controls={pickerOptionsId}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <StyledPlaceholder>{pickerLabel}</StyledPlaceholder>
          </Button>
        )}
      </StyledClickableContainer>
      <Dropdown
        dropdownId={dropdownId}
        dropdownPlacement="bottom-start"
        positionReference={containerElement}
        excludedClickOutsideIds={[dropdownId]}
        onOpen={handleOpenDropdown}
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
    </>
  );
};
