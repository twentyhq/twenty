import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { Temporal } from 'temporal-polyfill';

import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DateTimePicker';
import { OverlayContainer } from '@/ui/layout/overlay/components/OverlayContainer';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar } from 'twenty-ui/display';

const StyledInputContainer = styled.div`
  position: relative;
`;

const StyledInput = styled.div<{ hasValue: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme, hasValue }) =>
    hasValue ? theme.font.color.primary : theme.font.color.light};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 32px;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  width: 100%;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledDatePickerContainer = styled.div`
  left: 0;
  position: absolute;
  top: 100%;
  z-index: 1000;
`;

const StyledIconContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

type EventLogDatePickerInputProps = {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
};

export const EventLogDatePickerInput = ({
  label,
  value,
  onChange,
  placeholder,
}: EventLogDatePickerInputProps) => {
  const { t } = useLingui();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsOpen(false);
  };

  useListenClickOutside({
    refs: [containerRef],
    listenerId: `event-log-date-picker-${label}`,
    callback: handleClose,
    enabled: isOpen,
    excludedClickOutsideIds: [
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
      <StyledInput hasValue={isDefined(value)} onClick={() => setIsOpen(true)}>
        <StyledIconContainer>
          <IconCalendar size={16} />
        </StyledIconContainer>
        {formatDisplayValue(value)}
      </StyledInput>
      {isOpen && (
        <StyledDatePickerContainer>
          <OverlayContainer>
            <DateTimePicker
              instanceId={`event-log-date-picker-${label}`}
              date={zonedDateTime}
              onChange={handleDateTimeSelect}
              onClose={handleDateTimeSelect}
              onClear={handleClear}
              clearable
            />
          </OverlayContainer>
        </StyledDatePickerContainer>
      )}
    </StyledInputContainer>
  );
};
