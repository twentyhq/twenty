import { styled } from '@linaria/react';
import { lazy, Suspense, useContext, type ComponentType } from 'react';
import type { DatePickerProps as ReactDatePickerLibProps } from 'react-datepicker';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import 'react-datepicker/dist/react-datepicker.css';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import {
  isDefined,
  turnJSDateToPlainDate,
  turnPlainDateToShiftedDateInSystemTimeZone,
  type RelativeDateFilter,
} from 'twenty-shared/utils';
import { IconCalendarX } from 'twenty-ui/icon';
import { MenuItemLeftContent } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const DATE_PICKER_CONTAINER_WIDTH = 280;

const StyledContainer = styled.div<{ calendarDisabled?: boolean }>`
  width: ${DATE_PICKER_CONTAINER_WIDTH}px;

  & .react-datepicker {
    border-color: ${themeCssVariables.border.color.light};
    background: transparent;
    font-family: 'Inter';
    font-size: ${themeCssVariables.font.size.md};
    border: none;
    display: block;
    font-weight: ${themeCssVariables.font.weight.regular};
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
    color: ${themeCssVariables.font.color.primary};
    margin-left: ${themeCssVariables.spacing[1]};
    margin-bottom: ${themeCssVariables.spacing[10]};
  }

  & .react-datepicker__month-dropdown-container,
  & .react-datepicker__year-dropdown-container {
    text-align: left;
    border-radius: ${themeCssVariables.border.radius.sm};
    margin-left: ${themeCssVariables.spacing[1]};
    margin-right: 0;
    padding: ${themeCssVariables.spacing[2]};
    padding-right: ${themeCssVariables.spacing[4]};
    background-color: ${themeCssVariables.background.tertiary};
  }

  & .react-datepicker__month-read-view--down-arrow,
  & .react-datepicker__year-read-view--down-arrow {
    height: 5px;
    width: 5px;
    border-width: 1px 1px 0 0;
    border-color: ${themeCssVariables.border.color.light};
    top: 3px;
    right: -6px;
  }

  & .react-datepicker__year-read-view,
  & .react-datepicker__month-read-view {
    padding-right: ${themeCssVariables.spacing[2]};
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
    top: ${themeCssVariables.spacing[2]};
  }
  & .react-datepicker__month-dropdown {
    left: ${themeCssVariables.spacing[2]};
    height: 260px;
  }

  & .react-datepicker__year-dropdown {
    left: calc(${themeCssVariables.spacing[9]} + 80px);
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
    padding: ${themeCssVariables.spacing[2]}
      calc(${themeCssVariables.spacing[2]} - 2px);
    width: calc(100% - ${themeCssVariables.spacing[4]});
    border-radius: ${themeCssVariables.border.radius.xs};
    color: ${themeCssVariables.font.color.secondary};
    cursor: pointer;
    margin: 2px;

    &:hover {
      background: ${themeCssVariables.background.transparent.light};
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
    color: ${themeCssVariables.font.color.secondary};
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
    border-radius: ${themeCssVariables.border.radius.sm};
    padding-top: 6px;
    &:hover {
      background: ${themeCssVariables.background.transparent.light};
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
    border-color: ${themeCssVariables.font.color.tertiary};
  }

  & .react-datepicker__day--keyboard-selected {
    background-color: inherit;
  }

  & .react-datepicker__day,
  .react-datepicker__time-name {
    color: ${themeCssVariables.font.color.primary};
  }

  & .react-datepicker__day--selected,
  & .react-datepicker__day--in-range,
  & .react-datepicker__day--range-start,
  & .react-datepicker__day--range-end {
    background-color: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.background.primary};

    &.react-datepicker__day:hover {
      color: ${themeCssVariables.background.primary};
    }
  }

  & .react-datepicker__day--outside-month {
    color: ${themeCssVariables.font.color.tertiary};
  }

  & .react-datepicker__day:hover {
    color: ${themeCssVariables.font.color.tertiary};
  }

  & .clearable {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledButtonContainer = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
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

const StyledDatePickerFallback = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 300px;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  width: 280px;
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

// react-datepicker v9 types its props as a discriminated union keyed on
// selectsRange/selectsMultiple. We drive selectsRange dynamically (relative
// filters highlight a contiguous range), which TS cannot narrow to a single
// union branch, so collapse the discriminants to plain optionals.
type DatePickerPropsType = Omit<
  ReactDatePickerLibProps,
  'selectsRange' | 'selectsMultiple' | 'onChange' | 'formatMultipleDates'
> & {
  selectsRange?: boolean;
  onChange?: (date: Date | null) => void;
};

const ReactDatePicker = lazy<ComponentType<DatePickerPropsType>>(() =>
  import('react-datepicker').then((mod) => ({
    // react-datepicker ships CJS; under vite 8 this dynamic import's `default`
    // can be the module namespace ({ default: Component }) rather than the
    // component itself, so unwrap a nested default when present.
    default: ((mod.default as any)?.default ??
      mod.default) as unknown as ComponentType<DatePickerPropsType>,
  })),
);

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
  const { theme } = useContext(ThemeContext);
  const plainDate = isDefined(plainDateString)
    ? Temporal.PlainDate.from(plainDateString)
    : Temporal.Now.plainDateISO();

  // Relative filters preview a resolved range; the calendar opens on its first
  // month and highlights it via react-datepicker's native range selection. The
  // stored `end` is exclusive, so the last highlighted day is `end - 1 day`.
  const relativeRangeStart = isRelative ? relativeDate?.start : undefined;
  const relativeRangeEnd = isRelative ? relativeDate?.end : undefined;

  const relativeRangeStartPlainDate = isDefined(relativeRangeStart)
    ? Temporal.PlainDate.from(relativeRangeStart)
    : null;

  const relativeRangeEndPlainDate = isDefined(relativeRangeEnd)
    ? Temporal.PlainDate.from(relativeRangeEnd).subtract({ days: 1 })
    : null;

  const relativeRangeStartDate = isDefined(relativeRangeStartPlainDate)
    ? turnPlainDateToShiftedDateInSystemTimeZone(relativeRangeStartPlainDate)
    : undefined;

  const relativeRangeEndDate = isDefined(relativeRangeEndPlainDate)
    ? turnPlainDateToShiftedDateInSystemTimeZone(relativeRangeEndPlainDate)
    : undefined;

  // Remount the calendar when the resolved range changes so it re-opens on the
  // range's first month (react-datepicker only honors openToDate on mount).
  const relativeDateRangeKey =
    isDefined(relativeRangeStart) && isDefined(relativeRangeEnd)
      ? `${relativeRangeStart}-${relativeRangeEnd}`
      : undefined;

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
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

  const handleChangeMonth = (month: number) => {
    const newDate = plainDate?.with({ month: month });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleAddMonth = () => {
    const newDate = plainDate?.add({ months: 1 });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleSubtractMonth = () => {
    const newDate = plainDate?.subtract({ months: 1 });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleChangeYear = (year: number) => {
    const newDate = plainDate?.with({ year: year });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleDateChange = (datePicked: Date | null) => {
    if (!isDefined(datePicked)) {
      return;
    }
    const plainDatePicked = turnJSDateToPlainDate(datePicked);

    onChange?.(plainDatePicked.toString());
  };

  const handleDateSelect = (datePicked: Date | null) => {
    if (!isDefined(datePicked)) {
      return;
    }
    const plainDatePicked = turnJSDateToPlainDate(datePicked);

    handleClose?.(plainDatePicked.toString());
  };

  const calendarStartDay =
    currentWorkspaceMember?.calendarStartDay === CalendarStartDay.SYSTEM
      ? CalendarStartDay[detectCalendarStartDay()]
      : (currentWorkspaceMember?.calendarStartDay ?? undefined);

  const dateForDatePicker = turnPlainDateToShiftedDateInSystemTimeZone(plainDate);

  return (
    <StyledContainer calendarDisabled={isRelative}>
      <div className={clearable ? 'clearable ' : ''}>
        <Suspense
          fallback={
            <StyledDatePickerFallback>
              <SkeletonTheme
                baseColor={theme.background.tertiary}
                highlightColor={theme.background.transparent.lighter}
                borderRadius={2}
              >
                <Skeleton
                  width={DATE_PICKER_CONTAINER_WIDTH - 16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={DATE_PICKER_CONTAINER_WIDTH - 16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={DATE_PICKER_CONTAINER_WIDTH - 16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={DATE_PICKER_CONTAINER_WIDTH - 16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
              </SkeletonTheme>
            </StyledDatePickerFallback>
          }
        >
          <ReactDatePicker
            key={relativeDateRangeKey}
            open={true}
            disabledKeyboardNavigation
            onChange={handleDateChange}
            onSelect={handleDateSelect}
            openToDate={isRelative ? relativeRangeStartDate : dateForDatePicker}
            selectsRange={isRelative ? true : undefined}
            startDate={isRelative ? relativeRangeStartDate : undefined}
            endDate={isRelative ? relativeRangeEndDate : undefined}
            selected={isRelative ? undefined : dateForDatePicker}
            calendarStartDay={
              calendarStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
            }
            renderCustomHeader={({
              monthDate,
              decreaseMonth,
              increaseMonth,
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
                  calendarMonthDate={monthDate}
                  onPreviousMonth={decreaseMonth}
                  onNextMonth={increaseMonth}
                  prevMonthButtonDisabled={prevMonthButtonDisabled}
                  nextMonthButtonDisabled={nextMonthButtonDisabled}
                />
              ) : (
                <DatePickerHeader
                  date={plainDate?.toString() ?? null}
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
          />
        </Suspense>
      </div>
      {clearable && (
        <StyledButtonContainer onClick={handleClear}>
          <StyledButtonContent>
            <MenuItemLeftContent LeftIcon={IconCalendarX} text={t`Clear`} />
          </StyledButtonContent>
        </StyledButtonContainer>
      )}
    </StyledContainer>
  );
};
