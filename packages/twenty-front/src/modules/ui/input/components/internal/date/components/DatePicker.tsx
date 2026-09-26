import { styled } from '@linaria/react';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import { DatePickerMonthGrid } from '@/ui/input/components/internal/date/components/DatePickerMonthGrid';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { useRelativeDatePickerVisibleMonth } from '@/ui/input/components/internal/date/hooks/useRelativeDatePickerVisibleMonth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';

import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import { isDefined, type RelativeDateFilter } from 'twenty-shared/utils';
import { IconCalendarX } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const StyledButtonContainer = styled.div`
  align-items: center;
  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  margin: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
  width: auto;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledButtonContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: start;
`;

type DatePickerProps = {
  instanceId: string;
  isRelative?: boolean;
  hideHeaderInput?: boolean;
  plainDateString: Nullable<string>;
  relativeDate?: RelativeDateFilter & {
    start: string;
    end: string;
  };
  onClose?: (date: string | null) => void;
  onChange?: (date: string | null) => void;
  onRelativeDateChange?: (
    relativeDateFilter: RelativeDateFilter | null,
  ) => void;
  clearable?: boolean;
  onEnter?: (date: string | null) => void;
  onEscape?: (date: string | null) => void;
  keyboardEventsDisabled?: boolean;
  onClear?: () => void;
  hideCalendar?: boolean;
};

export const DatePicker = ({
  instanceId,
  plainDateString,
  onChange,
  onClose,
  clearable = true,
  onClear,
  isRelative,
  relativeDate,
  onRelativeDateChange,
  hideHeaderInput,
}: DatePickerProps) => {
  const theme = useTheme();
  const { calendarSystem } = useDateTimeFormat();

  const plainDate = isDefined(plainDateString)
    ? Temporal.PlainDate.from(plainDateString)
    : Temporal.Now.plainDateISO();
  const calendarPlainDate = plainDate.withCalendar(calendarSystem);

  const relativeRangeStart = isRelative ? relativeDate?.start : undefined;
  const relativeRangeEnd = isRelative ? relativeDate?.end : undefined;

  const relativeRangeStartPlainDate = isDefined(relativeRangeStart)
    ? Temporal.PlainDate.from(relativeRangeStart)
    : null;

  const relativeRangeEndPlainDate = isDefined(relativeRangeEnd)
    ? Temporal.PlainDate.from(relativeRangeEnd).subtract({ days: 1 })
    : null;

  const {
    visibleMonthDate: relativeVisibleMonthDate,
    showPreviousMonth,
    showNextMonth,
  } = useRelativeDatePickerVisibleMonth({
    rangeStartDate: relativeRangeStartPlainDate,
    rangeEndDate: relativeRangeEndPlainDate,
  });

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();

  const handleClear = () => {
    closeDropdowns();
    onClear?.();
  };

  const closeDropdowns = () => {
    closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
    closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);
  };

  const handleClose = (newDate: string) => {
    closeDropdowns();
    onClose?.(newDate);
  };

  const changeToCalendarDate = (newCalendarPlainDate: Temporal.PlainDate) => {
    onChange?.(newCalendarPlainDate.withCalendar('iso8601').toString());
  };

  const handleChangeMonth = (month: number) => {
    changeToCalendarDate(calendarPlainDate.with({ month }));
  };

  const handleAddMonth = () => {
    changeToCalendarDate(calendarPlainDate.add({ months: 1 }));
  };

  const handleSubtractMonth = () => {
    changeToCalendarDate(calendarPlainDate.subtract({ months: 1 }));
  };

  const handleChangeYear = (year: number) => {
    changeToCalendarDate(calendarPlainDate.with({ year }));
  };

  const handleDateClick = (plainDatePicked: Temporal.PlainDate) => {
    onChange?.(plainDatePicked.toString());
    handleClose(plainDatePicked.toString());
  };

  return (
    <StyledDatePickerContainer>
      <div className={clearable ? 'clearable ' : ''}>
        {isRelative ? (
          <RelativeDatePickerHeader
            instanceId={instanceId}
            direction={relativeDate?.direction ?? 'PAST'}
            amount={relativeDate?.amount}
            unit={relativeDate?.unit ?? 'DAY'}
            onChange={onRelativeDateChange}
            calendarMonthDate={relativeVisibleMonthDate}
            onPreviousMonth={showPreviousMonth}
            onNextMonth={showNextMonth}
          />
        ) : (
          <DatePickerHeader
            date={plainDate.toString()}
            onChange={onChange}
            onChangeMonth={handleChangeMonth}
            onChangeYear={handleChangeYear}
            onAddMonth={handleAddMonth}
            onSubtractMonth={handleSubtractMonth}
            hideInput={hideHeaderInput}
          />
        )}
        <DatePickerMonthGrid
          visibleMonthDate={isRelative ? relativeVisibleMonthDate : plainDate}
          selectedDate={isRelative ? null : plainDate}
          rangeStartDate={relativeRangeStartPlainDate}
          rangeEndDate={relativeRangeEndPlainDate}
          disabled={isRelative}
          onDateClick={handleDateClick}
        />
      </div>
      {clearable && (
        <StyledButtonContainer onClick={handleClear}>
          <StyledButtonContent>
            <IconCalendarX size={theme.icon.size.md} />
            <Text>{t`Clear`}</Text>
          </StyledButtonContent>
        </StyledButtonContainer>
      )}
    </StyledDatePickerContainer>
  );
};
