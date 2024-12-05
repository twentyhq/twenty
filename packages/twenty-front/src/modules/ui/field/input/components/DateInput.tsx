import styled from '@emotion/styled';
import { Nullable } from 'twenty-ui';

import {
  InternalDatePicker,
  MONTH_AND_YEAR_DROPDOWN_ID,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/InternalDatePicker';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const StyledCalendarContainer = styled.div`
  background: ${({ theme }) => theme.background.transparent.secondary};
  backdrop-filter: ${({ theme }) => theme.blur.medium};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
`;

export type DateInputProps = {
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
  temporaryValue: Nullable<Date>;
  setTemporaryValue: (newValue: Nullable<Date>) => void;
  wrapperRef: React.RefObject<HTMLElement>;
};

export const DateInput = ({
  onEnter,
  onEscape,
  onClickOutside,
  clearable,
  onChange,
  isDateTimeInput,
  onClear,
  onSubmit,
  hideHeaderInput,
  wrapperRef,
  temporaryValue,
  setTemporaryValue,
}: DateInputProps) => {
  const handleChange = (newDate: Date | null) => {
    setTemporaryValue(newDate);
    onChange?.(newDate);
  };

  const handleClear = () => {
    setTemporaryValue(null);
    onClear?.();
  };

  const handleMouseSelect = (newDate: Date | null) => {
    setTemporaryValue(newDate);
    onSubmit?.(newDate);
  };

  const { closeDropdown } = useDropdown(MONTH_AND_YEAR_DROPDOWN_ID);
  const { closeDropdown: closeDropdownMonthSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  );
  const { closeDropdown: closeDropdownYearSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
  );

  useListenClickOutside({
    refs: [wrapperRef],
    listenerId: 'DateInput',
    callback: (event) => {
      event.stopImmediatePropagation();
      closeDropdownYearSelect();
      closeDropdownMonthSelect();
      closeDropdown();
      onClickOutside(event, temporaryValue);
    },
  });

  return (
    <StyledCalendarContainer>
      <InternalDatePicker
        date={temporaryValue ?? new Date()}
        onChange={handleChange}
        onMouseSelect={handleMouseSelect}
        clearable={clearable ? clearable : false}
        isDateTimeInput={isDateTimeInput}
        onEnter={onEnter}
        onEscape={onEscape}
        onClear={handleClear}
        hideHeaderInput={hideHeaderInput}
      />
    </StyledCalendarContainer>
  );
};
