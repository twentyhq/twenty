import { useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { flip, offset, useFloating } from '@floating-ui/react';
import { Nullable } from 'twenty-ui';

import { DateDisplay } from '@/ui/field/display/components/DateDisplay';
import { InternalDatePicker } from '@/ui/input/components/internal/date/components/InternalDatePicker';
import {
  MONTH_AND_YEAR_DROPDOWN_ID,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/MonthAndYearDropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useListenClickOutsideV2 } from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';

const StyledCalendarContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  position: absolute;

  z-index: 1;
`;

const StyledInputContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(0)} ${({ theme }) => theme.spacing(2)};

  width: 100%;
`;

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
}: DateInputProps) => {
  const theme = useTheme();

  const [internalValue, setInternalValue] = useState(value);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [
      flip(),
      offset({
        mainAxis: theme.spacingMultiplicator * -6,
      }),
    ],
  });

  const handleChange = (newDate: Date | null) => {
    setInternalValue(newDate);
    onChange?.(newDate);
  };

  const handleClear = () => {
    setInternalValue(null);
    onClear?.();
  };

  const { closeDropdown } = useDropdown(MONTH_AND_YEAR_DROPDOWN_ID);
  const { closeDropdown: closeDropdownMonthSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  );
  const { closeDropdown: closeDropdownYearSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
  );

  useListenClickOutsideV2({
    refs: [wrapperRef],
    listenerId: 'DateInput',
    callback: (event) => {
      event.stopImmediatePropagation();

      closeDropdownYearSelect();
      closeDropdownMonthSelect();
      closeDropdown();
      onClickOutside(event, internalValue);
    },
  });

  return (
    <div ref={wrapperRef}>
      <div ref={refs.setReference}>
        <StyledInputContainer>
          <DateDisplay value={internalValue ?? new Date()} />
        </StyledInputContainer>
      </div>
      <div ref={refs.setFloating} style={floatingStyles}>
        <StyledCalendarContainer>
          <InternalDatePicker
            date={internalValue ?? new Date()}
            onChange={handleChange}
            onMouseSelect={(newDate: Date | null) => {
              onEnter(newDate);
            }}
            clearable={clearable ? clearable : false}
            isDateTimeInput={isDateTimeInput}
            onEnter={onEnter}
            onEscape={onEscape}
            onClear={handleClear}
          />
        </StyledCalendarContainer>
      </div>
    </div>
  );
};
