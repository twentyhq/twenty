import { styled } from '@linaria/react';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';

import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSpacer = styled.div`
  height: ${themeCssVariables.spacing[2]};
  width: auto;
`;

type DatePickerWithoutCalendarProps = {
  instanceId: string;

  date: Nullable<string>;

  onClose?: (date: string | null) => void;
  onChange?: (date: string | null) => void;

  onEnter?: (date: string | null) => void;
  onEscape?: (date: string | null) => void;
  keyboardEventsDisabled?: boolean;
};

export const DatePickerWithoutCalendar = ({
  date,
  onChange,
}: DatePickerWithoutCalendarProps) => {
  const { calendarSystem } = useDateTimeFormat();

  const plainDate = isDefined(date) ? Temporal.PlainDate.from(date) : null;
  const calendarPlainDate = plainDate?.withCalendar(calendarSystem);

  const changeToCalendarDate = (
    newCalendarPlainDate: Temporal.PlainDate | undefined,
  ) => {
    onChange?.(
      newCalendarPlainDate?.withCalendar('iso8601').toString() ?? null,
    );
  };

  const handleChangeMonth = (month: number) => {
    changeToCalendarDate(calendarPlainDate?.with({ month }));
  };

  const handleAddMonth = () => {
    changeToCalendarDate(calendarPlainDate?.add({ months: 1 }));
  };

  const handleSubtractMonth = () => {
    changeToCalendarDate(calendarPlainDate?.subtract({ months: 1 }));
  };

  const handleChangeYear = (year: number) => {
    changeToCalendarDate(calendarPlainDate?.with({ year }));
  };

  return (
    <StyledDatePickerContainer>
      <DatePickerHeader
        date={plainDate?.toString() ?? null}
        onChange={onChange}
        onChangeMonth={handleChangeMonth}
        onChangeYear={handleChangeYear}
        onAddMonth={handleAddMonth}
        onSubtractMonth={handleSubtractMonth}
        hideInput={true}
      />
      <StyledSpacer />
    </StyledDatePickerContainer>
  );
};
