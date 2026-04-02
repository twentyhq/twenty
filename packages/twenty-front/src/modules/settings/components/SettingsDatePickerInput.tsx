import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import {
  autoUpdate,
  FloatingPortal,
  offset,
  flip,
  useFloating,
} from '@floating-ui/react';

import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DateTimePicker';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const SETTINGS_DATE_PICKER_CLICK_OUTSIDE_ID = 'settings-date-picker-floating';

const StyledInputContainer = styled.div`
  position: relative;
`;

const StyledInput = styled.div<{ hasValue: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${({ hasValue }) =>
    hasValue
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.light};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: 100%;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledIconContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledFloatingContainer = styled.div`
  z-index: 1000;
`;

export type SettingsDatePickerInputProps = {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
};

export const SettingsDatePickerInput = ({
  label,
  value,
  onChange,
  placeholder,
}: SettingsDatePickerInputProps) => {
  const { t } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement: 'bottom-start',
    middleware: [offset(4), flip()],
    whileElementsMounted: autoUpdate,
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  useListenClickOutside({
    refs: [containerRef],
    listenerId: `settings-date-picker-${label}`,
    callback: handleClose,
    enabled: isOpen,
    excludedClickOutsideIds: [
      SETTINGS_DATE_PICKER_CLICK_OUTSIDE_ID,
      MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
      MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
    ],
  });

  const handleDateTimeSelect = (newDateTime: Temporal.ZonedDateTime | null) => {
    if (isDefined(newDateTime)) {
      onChange(new Date(newDateTime.epochMilliseconds));
    }
    handleClose();
  };

  const handleClear = () => {
    onChange(undefined);
    handleClose();
  };

  const formatDisplayValue = (date: Date | undefined): string => {
    if (!isDefined(date)) {
      return placeholder ?? t`Select date & time`;
    }

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const zonedDateTime = isDefined(value)
    ? Temporal.Instant.fromEpochMilliseconds(
        value.getTime(),
      ).toZonedDateTimeISO(Temporal.Now.timeZoneId())
    : null;

  return (
    <StyledInputContainer ref={containerRef}>
      <StyledLabel>{label}</StyledLabel>
      <StyledInput
        ref={refs.setReference}
        hasValue={isDefined(value)}
        onClick={() => setIsOpen(true)}
      >
        <StyledIconContainer>
          <IconCalendar size={16} />
        </StyledIconContainer>
        {formatDisplayValue(value)}
      </StyledInput>
      {isOpen && (
        <FloatingPortal>
          <StyledFloatingContainer
            ref={refs.setFloating}
            style={floatingStyles}
            data-click-outside-id={SETTINGS_DATE_PICKER_CLICK_OUTSIDE_ID}
          >
            <OverlayContainer>
              <DateTimePicker
                instanceId={`settings-date-picker-${label}`}
                date={zonedDateTime}
                onChange={handleDateTimeSelect}
                onClose={handleClose}
                onClear={handleClear}
                clearable
              />
            </OverlayContainer>
          </StyledFloatingContainer>
        </FloatingPortal>
      )}
    </StyledInputContainer>
  );
};
