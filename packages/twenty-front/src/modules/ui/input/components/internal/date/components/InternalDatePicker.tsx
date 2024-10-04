import styled from '@emotion/styled';
import { DateTime } from 'luxon';
import ReactDatePicker from 'react-datepicker';
import { Key } from 'ts-key-enum';
import { IconCalendarX, OVERLAY_BACKGROUND } from 'twenty-ui';

import { DateTimeInput } from '@/ui/input/components/internal/date/components/DateTimeInput';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { isDefined } from '~/utils/isDefined';

import { AbsoluteDatePickerHeader } from '@/ui/input/components/internal/date/components/AbsoluteDatePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { getHighlightedDates } from '@/ui/input/components/internal/date/utils/getHighlightedDates';
import { UserContext } from '@/users/contexts/UserContext';
import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/utils/view-filter-value/resolveDateViewFilterValue';
import { useContext } from 'react';
import 'react-datepicker/dist/react-datepicker.css';

export const MONTH_AND_YEAR_DROPDOWN_ID = 'date-picker-month-and-year-dropdown';
export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const StyledContainer = styled.div<{ calendarDisabled?: boolean }>`
  & .react-datepicker {
    border-color: ${({ theme }) => theme.border.color.light};
    background: transparent;
    font-family: 'Inter';
    font-size: ${({ theme }) => theme.font.size.md};
    border: none;
    display: block;
    font-weight: ${({ theme }) => theme.font.weight.regular};
  }

  & .react-datepicker-popper {
    position: relative !important;
    inset: auto !important;
    transform: none !important;
    padding: 0 !important;
  }

  & .react-datepicker__triangle {
    display: none;
  }

  & .react-datepicker__triangle::after {
    display: none;
  }

  & .react-datepicker__triangle::before {
    display: none;
  }

  & .react-datepicker-wrapper {
    display: none;
  }

  // Header

  & .react-datepicker__header {
    background: transparent;
    border: none;
    padding: 0;
  }

  &
    .react-datepicker__input-time-container
    .react-datepicker-time__input-container
    .react-datepicker-time__input {
    outline: none;
  }

  & .react-datepicker__header__dropdown {
    display: flex;
    color: ${({ theme }) => theme.font.color.primary};
    margin-left: ${({ theme }) => theme.spacing(1)};
    margin-bottom: ${({ theme }) => theme.spacing(10)};
  }

  & .react-datepicker__month-dropdown-container,
  & .react-datepicker__year-dropdown-container {
    text-align: left;
    border-radius: ${({ theme }) => theme.border.radius.sm};
    margin-left: ${({ theme }) => theme.spacing(1)};
    margin-right: 0;
    padding: ${({ theme }) => theme.spacing(2)};
    padding-right: ${({ theme }) => theme.spacing(4)};
    background-color: ${({ theme }) => theme.background.tertiary};
  }

  & .react-datepicker__month-read-view--down-arrow,
  & .react-datepicker__year-read-view--down-arrow {
    height: 5px;
    width: 5px;
    border-width: 1px 1px 0 0;
    border-color: ${({ theme }) => theme.border.color.light};
    top: 3px;
    right: -6px;
  }

  & .react-datepicker__year-read-view,
  & .react-datepicker__month-read-view {
    padding-right: ${({ theme }) => theme.spacing(2)};
  }

  & .react-datepicker__month-dropdown-container {
    width: 80px;
  }

  & .react-datepicker__year-dropdown-container {
    width: 50px;
  }

  & .react-datepicker__month-dropdown,
  & .react-datepicker__year-dropdown {
    border: ${({ theme }) => theme.border.color.light};
    ${OVERLAY_BACKGROUND}
    overflow-y: scroll;
    top: ${({ theme }) => theme.spacing(2)};
  }
  & .react-datepicker__month-dropdown {
    left: ${({ theme }) => theme.spacing(2)};
    width: 160px;
    height: 260px;
  }

  & .react-datepicker__year-dropdown {
    left: calc(${({ theme }) => theme.spacing(9)} + 80px);
    width: 100px;
    height: 260px;
  }

  & .react-datepicker__navigation--years {
    display: none;
  }

  & .react-datepicker__month-option--selected,
  & .react-datepicker__year-option--selected {
    display: none;
  }

  & .react-datepicker__year-option,
  & .react-datepicker__month-option {
    text-align: left;
    padding: ${({ theme }) => theme.spacing(2)}
      calc(${({ theme }) => theme.spacing(2)} - 2px);
    width: calc(100% - ${({ theme }) => theme.spacing(4)});
    border-radius: ${({ theme }) => theme.border.radius.xs};
    color: ${({ theme }) => theme.font.color.secondary};
    cursor: pointer;
    margin: 2px;

    &:hover {
      background: ${({ theme }) => theme.background.transparent.light};
    }
  }

  & .react-datepicker__year-option {
    &:first-of-type,
    &:last-of-type {
      display: none;
    }
  }

  & .react-datepicker__current-month {
    display: none;
  }

  & .react-datepicker__day-name {
    color: ${({ theme }) => theme.font.color.secondary};
    width: 34px;
    height: 40px;
    line-height: 40px;
  }

  & .react-datepicker__month-container {
    float: none;
  }

  // Days

  & .react-datepicker__month {
    margin-top: 0;

    pointer-events: ${({ calendarDisabled }) =>
      calendarDisabled ? 'none' : 'auto'};
    opacity: ${({ calendarDisabled }) => (calendarDisabled ? '0.5' : '1')};
  }

  & .react-datepicker__day {
    width: 34px;
    height: 34px;
    line-height: 34px;
  }

  & .react-datepicker__navigation--previous,
  & .react-datepicker__navigation--next {
    height: 34px;
    border-radius: ${({ theme }) => theme.border.radius.sm};
    padding-top: 6px;
    &:hover {
      background: ${({ theme }) => theme.background.transparent.light};
    }
  }
  & .react-datepicker__navigation--previous {
    right: 38px;
    top: 6px;
    left: auto;

    & > span {
      margin-left: -6px;
    }
  }

  & .react-datepicker__navigation--next {
    right: 6px;
    top: 6px;

    & > span {
      margin-left: 6px;
    }
  }

  & .react-datepicker__navigation-icon::before {
    height: 7px;
    width: 7px;
    border-width: 1px 1px 0 0;
    border-color: ${({ theme }) => theme.font.color.tertiary};
  }

  & .react-datepicker__day--keyboard-selected {
    background-color: inherit;
  }

  & .react-datepicker__day,
  .react-datepicker__time-name {
    color: ${({ theme }) => theme.font.color.primary};
  }

  & .react-datepicker__day--selected {
    background-color: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.grayScale.gray0};
  }

  & .react-datepicker__day--outside-month {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  & .react-datepicker__day:hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  & .clearable {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

const StyledButtonContainer = styled(StyledHoverableMenuItemBase)`
  height: ${({ theme }) => theme.spacing(4)};
  margin: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)};
  width: auto;
`;

const StyledButton = styled(MenuItemLeftContent)`
  justify-content: start;
`;

type InternalDatePickerProps = {
  isRelative?: boolean;
  date: Date | null;
  relativeDate?: {
    direction: VariableDateViewFilterValueDirection;
    amount?: number;
    unit: VariableDateViewFilterValueUnit;
  };
  highlightedDateRange?: {
    start: Date;
    end: Date;
  };
  onMouseSelect?: (date: Date | null) => void;
  onChange?: (date: Date | null) => void;
  onRelativeDateChange?: (
    relativeDate: {
      direction: VariableDateViewFilterValueDirection;
      amount?: number;
      unit: VariableDateViewFilterValueUnit;
    } | null,
  ) => void;
  clearable?: boolean;
  isDateTimeInput?: boolean;
  onEnter?: (date: Date | null) => void;
  onEscape?: (date: Date | null) => void;
  keyboardEventsDisabled?: boolean;
  onClear?: () => void;
};

export const InternalDatePicker = ({
  date,
  onChange,
  onMouseSelect,
  onEnter,
  onEscape,
  clearable = true,
  isDateTimeInput,
  keyboardEventsDisabled,
  onClear,
  isRelative,
  relativeDate,
  onRelativeDateChange,
  highlightedDateRange,
}: InternalDatePickerProps) => {
  const internalDate = date ?? new Date();

  const { timeZone } = useContext(UserContext);

  const { closeDropdown } = useDropdown(MONTH_AND_YEAR_DROPDOWN_ID);
  const { closeDropdown: closeDropdownMonthSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  );
  const { closeDropdown: closeDropdownYearSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
  );

  const handleClear = () => {
    closeDropdowns();
    onClear?.();
  };

  const closeDropdowns = () => {
    closeDropdownYearSelect();
    closeDropdownMonthSelect();
    closeDropdown();
  };

  const handleMouseSelect = (newDate: Date) => {
    closeDropdowns();
    onMouseSelect?.(newDate);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDefined(keyboardEventsDisabled) && keyboardEventsDisabled) {
      return;
    }

    switch (event.key) {
      case Key.Enter: {
        event.stopPropagation();
        event.preventDefault();

        closeDropdowns();
        onEnter?.(internalDate);
        break;
      }
      case Key.Escape: {
        event.stopPropagation();
        event.preventDefault();

        closeDropdowns();
        onEscape?.(internalDate);
        break;
      }
    }
  };

  const handleChangeMonth = (month: number) => {
    const newDate = new Date(internalDate);
    newDate.setMonth(month);
    onChange?.(newDate);
  };

  const handleAddMonth = () => {
    const dateParsed = DateTime.fromJSDate(internalDate, { zone: timeZone })
      .plus({ months: 1 })
      .toJSDate();

    onChange?.(dateParsed);
  };

  const handleSubtractMonth = () => {
    const dateParsed = DateTime.fromJSDate(internalDate, { zone: timeZone })
      .minus({ months: 1 })
      .toJSDate();

    onChange?.(dateParsed);
  };

  const handleChangeYear = (year: number) => {
    const dateParsed = DateTime.fromJSDate(internalDate, { zone: timeZone })
      .set({ year: year })
      .toJSDate();

    onChange?.(dateParsed);
  };

  const handleDateChange = (date: Date) => {
    const dateParsed = DateTime.fromJSDate(internalDate, {
      zone: isDateTimeInput ? timeZone : 'local',
    })
      .set({
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      })
      .toJSDate();

    onChange?.(dateParsed);
  };

  const handleDateSelect = (date: Date) => {
    const dateParsed = DateTime.fromJSDate(internalDate, {
      zone: isDateTimeInput ? timeZone : 'local',
    })
      .set({
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      })
      .toJSDate();

    handleMouseSelect?.(dateParsed);
  };

  const dateWithoutTime = DateTime.fromJSDate(internalDate)
    .toLocal()
    .set({
      day: internalDate.getUTCDate(),
      month: internalDate.getUTCMonth() + 1,
      year: internalDate.getUTCFullYear(),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    .toJSDate();

  const dateParsed = DateTime.fromJSDate(internalDate, {
    zone: isDateTimeInput ? timeZone : 'local',
  });

  // We have to force a end of day on the computer local timezone with the given date
  // Because JS Date API cannot hold a timezone other than the local one
  // And if we don't do that workaround we will have problems when changing the date
  // Because the shown date will have 1 day more or less than the real date
  // Leading to bugs where we select 1st of January and it shows 31st of December for example
  const endOfDayDateTimeInLocalTimezone = DateTime.now().set({
    day: dateParsed.get('day'),
    month: dateParsed.get('month'),
    year: dateParsed.get('year'),
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  });

  const endOfDayInLocalTimezone = endOfDayDateTimeInLocalTimezone.toJSDate();

  const dateToUse = isDateTimeInput ? endOfDayInLocalTimezone : dateWithoutTime;

  const highlightedDates = getHighlightedDates(highlightedDateRange);

  const selectedDates = isRelative ? highlightedDates : [dateToUse];

  return (
    <StyledContainer onKeyDown={handleKeyDown} calendarDisabled={isRelative}>
      <div className={clearable ? 'clearable ' : ''}>
        <ReactDatePicker
          open={true}
          selected={dateToUse}
          selectedDates={selectedDates}
          openToDate={isDefined(dateToUse) ? dateToUse : undefined}
          disabledKeyboardNavigation
          onChange={handleDateChange as any}
          customInput={
            <DateTimeInput
              date={internalDate}
              isDateTimeInput={isDateTimeInput}
              onChange={onChange}
              userTimezone={timeZone}
            />
          }
          renderCustomHeader={({
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) =>
            isRelative ? (
              <RelativeDatePickerHeader
                direction={relativeDate?.direction ?? 'PAST'}
                amount={relativeDate?.amount}
                unit={relativeDate?.unit ?? 'DAY'}
                onChange={onRelativeDateChange}
              />
            ) : (
              <AbsoluteDatePickerHeader
                date={internalDate}
                onChange={onChange}
                onChangeMonth={handleChangeMonth}
                onChangeYear={handleChangeYear}
                onAddMonth={handleAddMonth}
                onSubtractMonth={handleSubtractMonth}
                prevMonthButtonDisabled={prevMonthButtonDisabled}
                nextMonthButtonDisabled={nextMonthButtonDisabled}
                isDateTimeInput={isDateTimeInput}
                timeZone={timeZone}
              />
            )
          }
          onSelect={handleDateSelect}
          selectsMultiple={isRelative}
        />
      </div>
      {clearable && (
        <StyledButtonContainer onClick={handleClear}>
          <StyledButton LeftIcon={IconCalendarX} text="Clear" />
        </StyledButtonContainer>
      )}
    </StyledContainer>
  );
};
