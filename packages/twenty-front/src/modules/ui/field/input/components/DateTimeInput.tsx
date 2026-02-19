import { useCallback, useRef, useState } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useStore } from 'jotai';
import { type Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-ui/utilities';

export type DateTimeInputProps = {
  instanceId: string;
  value: Nullable<Temporal.Instant>;
  onEnter: (newDateTime: Nullable<Temporal.Instant>) => void;
  onEscape: (newDateTime: Nullable<Temporal.Instant>) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newDateTime: Nullable<Temporal.Instant>,
  ) => void;
  clearable?: boolean;
  onChange?: (newDateTime: Nullable<Temporal.Instant>) => void;
  onClear?: () => void;
  onSubmit?: (newDateTime: Nullable<Temporal.Instant>) => void;
  hideHeaderInput?: boolean;
};

export const DateTimeInput = ({
  instanceId,
  value,
  onEnter,
  onEscape,
  onClickOutside,
  clearable,
  onChange,
  onClear,
  onSubmit,
  hideHeaderInput,
}: DateTimeInputProps) => {
  const store = useStore();

  const [internalValue, setInternalValue] = useState(value);
  const { userTimezone } = useUserTimezone();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleChange = (newDateTime: Temporal.ZonedDateTime | null) => {
    setInternalValue(newDateTime?.toInstant());
    onChange?.(newDateTime?.toInstant());
  };

  const handleClear = () => {
    setInternalValue(null);
    onClear?.();
  };

  const handleClose = (newDateTime: Temporal.ZonedDateTime | null) => {
    setInternalValue(newDateTime?.toInstant());
    onSubmit?.(newDateTime?.toInstant());
  };

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();

  const handleEnter = () => {
    closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
    closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);

    onEnter(internalValue);
  };

  const handleEscape = () => {
    closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
    closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);

    onEscape(internalValue);
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const currentFocusId = store.get(currentFocusIdSelector.atom);

      if (currentFocusId === instanceId) {
        closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
        closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);
        onClickOutside(event, internalValue);
      }
    },
    [
      instanceId,
      closeDropdownYearSelect,
      closeDropdownMonthSelect,
      onClickOutside,
      internalValue,
      store,
    ],
  );

  const internalZonedDateTime = internalValue?.toZonedDateTimeISO(userTimezone);

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: wrapperRef,
    inputValue: internalZonedDateTime,
    onEnter: handleEnter,
    onEscape: handleEscape,
    onClickOutside: handleClickOutside,
  });

  return (
    <div ref={wrapperRef}>
      <DateTimePicker
        instanceId={instanceId}
        date={internalZonedDateTime ?? null}
        onChange={handleChange}
        onClose={handleClose}
        clearable={clearable ?? false}
        onEnter={handleEnter}
        onEscape={handleEscape}
        onClear={handleClear}
        hideHeaderInput={hideHeaderInput}
      />
    </div>
  );
};
