import styled from '@emotion/styled';
import { DateTime } from 'luxon';
import { IconChevronLeft, IconChevronRight, LightIconButton } from 'twenty-ui';

import { Select } from '@/ui/input/components/Select';
import { DateTimeInput } from '@/ui/input/components/internal/date/components/DateTimeInput';

import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import {
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from './InternalDatePicker';

const StyledCustomDatePickerHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};

  gap: ${({ theme }) => theme.spacing(1)};
`;

const years = Array.from(
  { length: 200 },
  (_, i) => new Date().getFullYear() + 5 - i,
).map((year) => ({ label: year.toString(), value: year }));

type AbsoluteDatePickerHeaderProps = {
  date: Date;
  onChange?: (date: Date | null) => void;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  onAddMonth: () => void;
  onSubtractMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  isDateTimeInput?: boolean;
  timeZone: string;
  hideInput?: boolean;
};

export const AbsoluteDatePickerHeader = ({
  date,
  onChange,
  onChangeMonth,
  onChangeYear,
  onAddMonth,
  onSubtractMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  isDateTimeInput,
  timeZone,
  hideInput = false,
}: AbsoluteDatePickerHeaderProps) => {
  const endOfDayDateTimeInLocalTimezone = DateTime.now().set({
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  });

  const endOfDayInLocalTimezone = endOfDayDateTimeInLocalTimezone.toJSDate();

  return (
    <>
      {!hideInput && (
        <DateTimeInput
          date={date}
          isDateTimeInput={isDateTimeInput}
          onChange={onChange}
          userTimezone={timeZone}
        />
      )}

      <StyledCustomDatePickerHeader>
        <Select
          dropdownId={MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID}
          options={getMonthSelectOptions()}
          onChange={onChangeMonth}
          value={endOfDayInLocalTimezone.getMonth()}
          fullWidth
        />
        <Select
          dropdownId={MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID}
          onChange={onChangeYear}
          value={endOfDayInLocalTimezone.getFullYear()}
          options={years}
          fullWidth
        />
        <LightIconButton
          Icon={IconChevronLeft}
          onClick={onSubtractMonth}
          size="medium"
          disabled={prevMonthButtonDisabled}
        />
        <LightIconButton
          Icon={IconChevronRight}
          onClick={onAddMonth}
          size="medium"
          disabled={nextMonthButtonDisabled}
        />
      </StyledCustomDatePickerHeader>
    </>
  );
};
