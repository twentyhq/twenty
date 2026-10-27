import { DatePickerCalendar } from '@/ui/input/components/internal/date/components/DatePickerCalendar';
import { DatePickerLoadingFallback } from '@/ui/input/components/internal/date/components/DatePickerLoadingFallback';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { styled } from '@linaria/react';
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
  instanceId,
  date,
  onChange,
  onClose,
}: DatePickerWithoutCalendarProps) => {
  const plainDate = isDefined(date) ? Temporal.PlainDate.from(date) : null;
  const handleChangeMonth = (month: number) => {
    onChange?.(plainDate?.with({ month }).toString() ?? null);
  };
  const handleChangeYear = (year: number) => {
    onChange?.(plainDate?.with({ year }).toString() ?? null);
  };
  const handleAddMonth = () => {
    onChange?.(plainDate?.add({ months: 1 }).toString() ?? null);
  };
  const handleSubtractMonth = () => {
    onChange?.(plainDate?.subtract({ months: 1 }).toString() ?? null);
  };

  return (
    <StyledDatePickerContainer>
      <DatePickerCalendar
        loadingFallback={<DatePickerLoadingFallback />}
        value={plainDate?.toString() ?? null}
        isGridHidden
        onChange={onChange}
        onSelect={onClose}
        renderHeader={(header) => (
          <>
            <DatePickerHeader
              instanceId={instanceId}
              date={plainDate?.toString() ?? null}
              onChange={onChange}
              onChangeMonth={handleChangeMonth}
              onChangeYear={handleChangeYear}
              onAddMonth={handleAddMonth}
              onSubtractMonth={handleSubtractMonth}
              prevMonthButtonDisabled={header.isPreviousMonthDisabled}
              nextMonthButtonDisabled={header.isNextMonthDisabled}
              hideInput
            />
            <StyledSpacer />
          </>
        )}
      />
    </StyledDatePickerContainer>
  );
};
