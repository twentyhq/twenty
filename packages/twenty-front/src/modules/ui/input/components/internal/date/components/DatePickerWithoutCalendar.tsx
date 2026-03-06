import { styled } from '@linaria/react';
import { Suspense, lazy, useContext, type ComponentType } from 'react';
import type { ReactDatePickerProps as ReactDatePickerLibProps } from 'react-datepicker';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import 'react-datepicker/dist/react-datepicker.css';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import { isDefined, turnJSDateToPlainDate } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const DATE_PICKER_CONTAINER_WIDTH = 280;
const DATE_PICKER_SKELETON_PADDING = 16;

const StyledContainer = styled.div<{
  calendarDisabled?: boolean;
  hideCalendar?: boolean;
}>`
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

    display: ${({ hideCalendar }) =>
      hideCalendar === true ? 'none' : 'visible'};
  }

  & .react-datepicker__day-names {
    display: ${({ hideCalendar }) =>
      hideCalendar === true ? 'none' : 'visible'};
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

  & .react-datepicker__day--selected {
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

const StyledSpacer = styled.div`
  height: ${themeCssVariables.spacing[2]};
  width: auto;
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

type DatePickerWithoutCalendarProps = {
  instanceId: string;

  date: Nullable<string>;

  onClose?: (date: string | null) => void;
  onChange?: (date: string | null) => void;

  onEnter?: (date: string | null) => void;
  onEscape?: (date: string | null) => void;
  keyboardEventsDisabled?: boolean;
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

export const DatePickerWithoutCalendar = ({
  date,
  onChange,
  onClose,
}: DatePickerWithoutCalendarProps) => {
  const { theme } = useContext(ThemeContext);
  const plainDate = isDefined(date) ? Temporal.PlainDate.from(date) : null;

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

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

  const handleDateChange = (datePicked: Date) => {
    const plainDatePicked = turnJSDateToPlainDate(datePicked);

    onChange?.(plainDatePicked.toString());
  };

  const handleDateSelect = (datePicked: Date) => {
    const plainDatePicked = turnJSDateToPlainDate(datePicked);

    handleClose?.(plainDatePicked.toString());
  };

  const calendarStartDay =
    currentWorkspaceMember?.calendarStartDay === CalendarStartDay.SYSTEM
      ? CalendarStartDay[detectCalendarStartDay()]
      : (currentWorkspaceMember?.calendarStartDay ?? undefined);

  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateShiftedToISOString = plainDate
    ?.toZonedDateTime(systemTimeZone)
    .toInstant()
    .toString();

  const dateForDatePicker = isDefined(dateShiftedToISOString)
    ? new Date(dateShiftedToISOString)
    : null;

  return (
    <StyledContainer hideCalendar={true}>
      <div>
        <Suspense
          fallback={
            <StyledDatePickerFallback>
              <SkeletonTheme
                baseColor={theme.background.tertiary}
                highlightColor={theme.background.transparent.lighter}
                borderRadius={2}
              >
                <Skeleton
                  width={
                    DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING
                  }
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={
                    DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING
                  }
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={
                    DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING
                  }
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={
                    DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING
                  }
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
              </SkeletonTheme>
            </StyledDatePickerFallback>
          }
        >
          <ReactDatePicker
            open={true}
            selected={dateForDatePicker}
            openToDate={dateForDatePicker ?? undefined}
            disabledKeyboardNavigation
            onChange={handleDateChange}
            calendarStartDay={calendarStartDay}
            renderCustomHeader={({
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <>
                <DatePickerHeader
                  date={plainDate?.toString() ?? null}
                  onChange={onChange}
                  onChangeMonth={handleChangeMonth}
                  onChangeYear={handleChangeYear}
                  onAddMonth={handleAddMonth}
                  onSubtractMonth={handleSubtractMonth}
                  prevMonthButtonDisabled={prevMonthButtonDisabled}
                  nextMonthButtonDisabled={nextMonthButtonDisabled}
                  hideInput={true}
                />
                <StyledSpacer />
              </>
            )}
            onSelect={handleDateSelect}
          />
        </Suspense>
      </div>
    </StyledContainer>
  );
};
