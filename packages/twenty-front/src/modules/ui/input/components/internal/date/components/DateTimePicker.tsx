import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  convertFirstDayOfTheWeekToCalendarStartDayNumber,
  isDefined,
  type RelativeDateFilter,
} from 'twenty-shared/utils';

import { DateTimePickerHeader } from '@/ui/input/components/internal/date/components/DateTimePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { getHighlightedDates } from '@/ui/input/components/internal/date/utils/getHighlightedDates';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { lazy, Suspense, type ComponentType } from 'react';
import type { ReactDatePickerProps as ReactDatePickerLibProps } from 'react-datepicker';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import 'react-datepicker/dist/react-datepicker.css';

import { IconCalendarX } from 'twenty-ui/display';
import {
  MenuItemLeftContent,
  StyledHoverableMenuItemBase,
} from 'twenty-ui/navigation';

import { useGetShiftedDateToSystemTimeZone } from '@/ui/input/components/internal/date/hooks/useGetShiftedDateToSystemTimeZone';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { Temporal } from 'temporal-polyfill';

export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const StyledContainer = styled.div<{
  calendarDisabled?: boolean;
}>`
  width: 280px;

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
    overflow-y: scroll;
    top: ${({ theme }) => theme.spacing(2)};
  }
  & .react-datepicker__month-dropdown {
    left: ${({ theme }) => theme.spacing(2)};
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
    color: ${({ theme }) => theme.background.primary};

    &.react-datepicker__day:hover {
      color: ${({ theme }) => theme.background.primary};
    }
  }

  & .react-datepicker__day--outside-month {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  & .react-datepicker__day:hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledSeparator = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  width: 100%;
`;

const StyledButtonContainer = styled(StyledHoverableMenuItemBase)`
  box-sizing: border-box;
  height: 32px;
  margin: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  width: auto;
`;

const StyledButton = styled(MenuItemLeftContent)`
  justify-content: start;
`;

const StyledDatePickerFallback = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 300px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  width: 280px;
`;

type DateTimePickerProps = {
  instanceId: string;
  isRelative?: boolean;
  hideHeaderInput?: boolean;
  date: Temporal.ZonedDateTime | null;
  relativeDate?: RelativeDateFilter & {
    start: Temporal.ZonedDateTime;
    end?: Temporal.ZonedDateTime;
  };
  onClose?: (date: Temporal.ZonedDateTime | null) => void;
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  onRelativeDateChange?: (
    relativeDateFilter: RelativeDateFilter | null,
  ) => void;
  clearable?: boolean;
  onEnter?: (date: Temporal.ZonedDateTime | null) => void;
  onEscape?: (date: Temporal.ZonedDateTime | null) => void;
  keyboardEventsDisabled?: boolean;
  onClear?: () => void;
  timeZone?: string;
};

type DatePickerPropsType = ReactDatePickerLibProps<
  boolean | undefined,
  boolean | undefined
>;

const ReactDatePicker = lazy<ComponentType<DatePickerPropsType>>(() =>
  import('react-datepicker').then((mod) => ({
    default: mod.default as unknown as ComponentType<DatePickerPropsType>,
  })),
);

export const DateTimePicker = ({
  instanceId,
  date,
  onChange,
  onClose,
  clearable = true,
  onClear,
  isRelative,
  relativeDate,
  onRelativeDateChange,
  hideHeaderInput,
  timeZone,
}: DateTimePickerProps) => {
  const theme = useTheme();

  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const { userTimezone } = useUserTimezone();

  const dateToUse =
    date ?? Temporal.Now.zonedDateTimeISO(timeZone ?? userTimezone);

  const { getShiftedDateToSystemTimeZone } =
    useGetShiftedDateToSystemTimeZone();

  const getZonedDateTimeFromDatePicked = (datePicked: Date) => {
    const plainDatePart = Temporal.PlainDate.from({
      day: datePicked.getDate(),
      month: datePicked.getMonth() + 1,
      year: datePicked.getFullYear(),
    });

    const zonedDateTime = plainDatePart
      .toZonedDateTime(timeZone ?? userTimezone)
      .with({
        hour: dateToUse?.hour ?? 0,
        minute: dateToUse?.minute ?? 0,
      });

    return { zonedDateTime };
  };

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

  const handleClose = (newDate: Temporal.ZonedDateTime) => {
    closeDropdowns();
    onClose?.(newDate);
  };

  const handleChangeMonth = (month: number) => {
    const newZonedDateTime = dateToUse?.with({ month: month }) ?? null;

    onChange?.(newZonedDateTime);
  };

  const handleAddMonth = () => {
    const newZonedDateTime = dateToUse?.add({ months: 1 }) ?? null;

    onChange?.(newZonedDateTime);
  };

  const handleSubtractMonth = () => {
    const newZonedDateTime = dateToUse?.subtract({ months: 1 }) ?? null;

    onChange?.(newZonedDateTime);
  };

  const handleChangeYear = (year: number) => {
    const newZonedDateTime = dateToUse?.with({ year: year }) ?? null;

    onChange?.(newZonedDateTime);
  };

  const handleDateChange = (newDate: Date) => {
    const { zonedDateTime } = getZonedDateTimeFromDatePicked(newDate);

    onChange?.(zonedDateTime);
  };

  const handleDateSelect = (newDate: Date) => {
    const { zonedDateTime } = getZonedDateTimeFromDatePicked(newDate);

    handleClose?.(zonedDateTime);
  };

  const highlightedDates =
    isRelative && isDefined(relativeDate?.end) && isDefined(relativeDate?.start)
      ? getHighlightedDates(
          relativeDate?.start.toPlainDate(),
          relativeDate?.end.subtract({ days: 1 }).toPlainDate(),
          timeZone ?? userTimezone,
        )
      : [];

  const nonShiftedDateForReactDatePicker = new Date(
    dateToUse.toInstant().toString(),
  );

  const shiftedDateForReactDatePicker = getShiftedDateToSystemTimeZone(
    nonShiftedDateForReactDatePicker,
    timeZone ?? userTimezone,
  );

  const selectedDates = isRelative
    ? highlightedDates.map((plainDate) => {
        const date = new Date();

        date.setDate(plainDate.day);
        date.setMonth(plainDate.month - 1);
        date.setFullYear(plainDate.year);

        return date;
      })
    : [shiftedDateForReactDatePicker];

  const calendarStartDayNumber =
    convertFirstDayOfTheWeekToCalendarStartDayNumber(userFirstDayOfTheWeek);

  return (
    <StyledContainer calendarDisabled={isRelative}>
      <Suspense
        fallback={
          <StyledDatePickerFallback>
            <SkeletonTheme
              baseColor={theme.background.tertiary}
              highlightColor={theme.background.transparent.lighter}
              borderRadius={4}
            >
              <Skeleton
                width={200}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
              />
              <Skeleton
                width={240}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
              />
              <Skeleton
                width={220}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
              />
              <Skeleton
                width={180}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            </SkeletonTheme>
          </StyledDatePickerFallback>
        }
      >
        <ReactDatePicker
          open={true}
          selected={shiftedDateForReactDatePicker}
          selectedDates={selectedDates}
          openToDate={shiftedDateForReactDatePicker}
          disabledKeyboardNavigation
          onChange={handleDateChange}
          calendarStartDay={calendarStartDayNumber}
          renderCustomHeader={({
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) =>
            isRelative ? (
              <RelativeDatePickerHeader
                instanceId={instanceId}
                direction={relativeDate?.direction ?? 'PAST'}
                amount={relativeDate?.amount}
                unit={relativeDate?.unit ?? 'DAY'}
                onChange={onRelativeDateChange}
                allowIntraDayUnits={true}
              />
            ) : (
              <DateTimePickerHeader
                date={dateToUse}
                onChange={onChange}
                onChangeMonth={handleChangeMonth}
                onChangeYear={handleChangeYear}
                onAddMonth={handleAddMonth}
                onSubtractMonth={handleSubtractMonth}
                prevMonthButtonDisabled={prevMonthButtonDisabled}
                nextMonthButtonDisabled={nextMonthButtonDisabled}
                hideInput={hideHeaderInput}
              />
            )
          }
          onSelect={handleDateSelect}
          selectsMultiple={isRelative}
        />
      </Suspense>
      {clearable && (
        <>
          <StyledSeparator />
          <StyledButtonContainer onClick={handleClear}>
            <StyledButton LeftIcon={IconCalendarX} text={t`Clear`} />
          </StyledButtonContainer>
        </>
      )}
    </StyledContainer>
  );
};
