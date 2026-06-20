import { styled } from '@linaria/react';

import { Select } from '@/ui/input/components/Select';

import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { DatePickerMonthYearNavigation } from '@/ui/input/components/internal/date/components/DatePickerMonthYearNavigation';

type DatePickerHeaderProps = {
  date: string | null;
  onChange?: (date: string | null) => void;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  onAddMonth: () => void;
  onSubtractMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  hideInput?: boolean;
};

const StyledDatePickerHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DatePickerHeader = ({
  date,
  onChange,
  onChangeMonth,
  onChangeYear,
  onAddMonth,
  onSubtractMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  hideInput = false,
}: DatePickerHeaderProps) => {
  return (
    <StyledDatePickerHeader>
      {!hideInput && <DatePickerInput date={date} onChange={onChange} />}
      <DatePickerMonthYearNavigation
        date={date}
        onChangeMonth={onChangeMonth}
        onChangeYear={onChangeYear}
        onAddMonth={onAddMonth}
        onSubtractMonth={onSubtractMonth}
        prevMonthButtonDisabled={prevMonthButtonDisabled}
        nextMonthButtonDisabled={nextMonthButtonDisabled}
      />
    </StyledDatePickerHeader>
  );
};
