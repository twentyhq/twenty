import { useRef, useState } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useRecoilCallback } from 'recoil';
import { type Nullable } from 'twenty-ui/utilities';

export type DateTimeInputProps = {
  instanceId: string;
  value: Nullable<Date>;
  onEnter: (newDateTime: Nullable<Date>) => void;
  onEscape: (newDateTime: Nullable<Date>) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newDateTime: Nullable<Date>,
  ) => void;
  clearable?: boolean;
  onChange?: (newDateTime: Nullable<Date>) => void;
  onClear?: () => void;
  onSubmit?: (newDateTime: Nullable<Date>) => void;
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
  const [internalValue, setInternalValue] = useState(value);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleChange = (newDateTime: Date | null) => {
    setInternalValue(newDateTime);
    onChange?.(newDateTime);
  };

  const handleClear = () => {
    setInternalValue(null);
    onClear?.();
  };

  const handleClose = (newDateTime: Date | null) => {
    setInternalValue(newDateTime);
    onSubmit?.(newDateTime);
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

  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent | TouchEvent) => {
        const currentFocusId = snapshot
          .getLoadable(currentFocusIdSelector)
          .getValue();

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
    ],
  );

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: wrapperRef,
    inputValue: internalValue,
    onEnter: handleEnter,
    onEscape: handleEscape,
    onClickOutside: handleClickOutside,
  });

  return (
    <div ref={wrapperRef}>
      <DateTimePicker
        date={internalValue ?? null}
        onChange={handleChange}
        onClose={handleClose}
        clearable={clearable ?? false}
        onEnter={onEnter}
        onEscape={onEscape}
        onClear={handleClear}
        hideHeaderInput={hideHeaderInput}
      />
    </div>
  );
};
