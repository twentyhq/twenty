import { useRef, useState } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import {
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useRecoilCallback } from 'recoil';
import { type Nullable } from 'twenty-ui/utilities';

export type DateInputProps = {
  instanceId: string;
  value: Nullable<string>;
  onEnter: (newDate: Nullable<string>) => void;
  onEscape: (newDate: Nullable<string>) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newDate: Nullable<string>,
  ) => void;
  clearable?: boolean;
  onChange?: (newDate: Nullable<string>) => void;
  onClear?: () => void;
  onSubmit?: (newDate: Nullable<string>) => void;
  hideHeaderInput?: boolean;
};

export const DateInput = ({
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
}: DateInputProps) => {
  const [internalValue, setInternalValue] = useState(value);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleChange = (newDate: string | null) => {
    setInternalValue(newDate);
    onChange?.(newDate);
  };

  const handleClear = () => {
    setInternalValue(null);
    onClear?.();
  };

  const handleClose = (newDate: string | null) => {
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
      <DatePicker
        instanceId={instanceId}
        plainDateString={internalValue ?? null}
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
