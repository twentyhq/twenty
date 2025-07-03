import { useRef, useState } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { useRecoilCallback } from 'recoil';
import { Nullable } from 'twenty-ui/utilities';

export type DateInputProps = {
  value: Nullable<Date>;
  onEnter: (newDate: Nullable<Date>) => void;
  onEscape: (newDate: Nullable<Date>) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<Date>,
  ) => void;
  clearable?: boolean;
  onChange?: (newDate: Nullable<Date>) => void;
  isDateTimeInput?: boolean;
  onClear?: () => void;
  onSubmit?: (newDate: Nullable<Date>) => void;
  hideHeaderInput?: boolean;
  hotkeyScope: string;
};

export const DateInput = ({
  value,
  onEnter,
  onEscape,
  onClickOutside,
  clearable,
  onChange,
  isDateTimeInput,
  onClear,
  onSubmit,
  hideHeaderInput,
  hotkeyScope,
}: DateInputProps) => {
  const [internalValue, setInternalValue] = useState(value);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleChange = (newDate: Date | null) => {
    setInternalValue(newDate);
    onChange?.(newDate);
  };

  const handleClear = () => {
    setInternalValue(null);
    onClear?.();
  };

  const handleClose = (newDate: Date | null) => {
    setInternalValue(newDate);
    onSubmit?.(newDate);
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
        const hotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();

        if (hotkeyScope?.scope === TableHotkeyScope.CellEditMode) {
          closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
          closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);
          onEscape(internalValue);
          onClickOutside(event, internalValue);
        }
      },
    [
      closeDropdownYearSelect,
      closeDropdownMonthSelect,
      onEscape,
      onClickOutside,
      internalValue,
    ],
  );

  useRegisterInputEvents({
    inputRef: wrapperRef,
    inputValue: internalValue,
    onEnter: handleEnter,
    onEscape: handleEscape,
    onClickOutside: handleClickOutside,
    hotkeyScope: hotkeyScope,
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
        isDateTimeInput={isDateTimeInput}
      />
    </div>
  );
};
