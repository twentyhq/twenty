import { useRef, useState } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import {
  DateTimePicker,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
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

  const { closeDropdown: closeDropdownMonthSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  );
  const { closeDropdown: closeDropdownYearSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
  );

  const handleEnter = () => {
    closeDropdownYearSelect();
    closeDropdownMonthSelect();

    onEnter(internalValue);
  };

  const handleEscape = () => {
    closeDropdownYearSelect();
    closeDropdownMonthSelect();

    onEscape(internalValue);
  };

  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent | TouchEvent) => {
        const hotkeyScope = snapshot
          .getLoadable(currentHotkeyScopeState)
          .getValue();

        if (hotkeyScope?.scope === TableHotkeyScope.CellEditMode) {
          closeDropdownYearSelect();
          closeDropdownMonthSelect();
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
        date={internalValue ?? new Date()}
        onChange={handleChange}
        onClose={handleClose}
        clearable={clearable ? clearable : false}
        onEnter={onEnter}
        onEscape={onEscape}
        onClear={handleClear}
        hideHeaderInput={hideHeaderInput}
        isDateTimeInput={isDateTimeInput}
      />
    </div>
  );
};
