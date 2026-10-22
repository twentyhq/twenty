import { DatePickerCalendar } from '@/ui/input/components/internal/date/components/DatePickerCalendar';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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
  instanceId,
  date,
  onChange,
}: DatePickerWithoutCalendarProps) => (
  <StyledDatePickerContainer>
    <DatePickerCalendar
      instanceId={instanceId}
      value={date ?? null}
      hideGrid
      onViewedMonthChange={(month) => {
        if (!isDefined(date)) {
          onChange?.(null);
          return;
        }

        const currentDate = Temporal.PlainDate.from(date);
        const nextMonth = Temporal.PlainYearMonth.from(month);

        onChange?.(
          currentDate
            .with({ year: nextMonth.year, month: nextMonth.month })
            .toString(),
        );
      }}
    />
  </StyledDatePickerContainer>
);
