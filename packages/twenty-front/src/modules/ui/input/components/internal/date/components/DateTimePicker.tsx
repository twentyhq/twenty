import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  convertFirstDayOfTheWeekToCalendarStartDayNumber,
  isDefined,
  type RelativeDateFilter,
} from 'twenty-shared/utils';

import {
  DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID,
  DateTimePickerHeader,
} from '@/ui/input/components/internal/date/components/DateTimePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { getHighlightedDates } from '@/ui/input/components/internal/date/utils/getHighlightedDates';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { lazy, Suspense, useContext, type ComponentType } from 'react';
import type { DatePickerProps as ReactDatePickerLibProps } from 'react-datepicker';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import 'react-datepicker/dist/react-datepicker.css';

import { IconCalendarX } from 'twenty-ui/icon';
import { MenuItemLeftContent } from 'twenty-ui/navigation';

import { useGetShiftedDateToSystemTimeZone } from '@/ui/input/components/internal/date/hooks/useGetShiftedDateToSystemTimeZone';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { Temporal } from 'temporal-polyfill';

export {
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DatePicker';
export { DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID } from '@/ui/input/components/internal/date/components/DateTimePickerHeader';

import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOuterWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  position: relative;
  width: 280px;
`;

const StyledSeparator = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  width: 100%;
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

// react-datepicker v9 types its props as a discriminated union keyed on
// selectsRange/selectsMultiple. We drive selectsMultiple dynamically, which TS
// cannot narrow to a single union branch, so collapse the discriminants to plain
// optionals (selectedDates is accepted but ignored by the library at runtime).
type DatePickerPropsType = Omit<
  ReactDatePickerLibProps,
  'selectsRange' | 'selectsMultiple' | 'onChange' | 'formatMultipleDates'
> & {
  selectsRange?: boolean;
  selectsMultiple?: boolean;
  selectedDates?: Date[];
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
  const { theme } = useContext(ThemeContext);
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const { userTimezone } = useUserTimezone();

  const dateToUse =
    date ?? Temporal.Now.zonedDateTimeISO(timeZone ?? userTimezone);

  const { closeDropdown: closeMonthYearPanel } = useCloseDropdown();

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

  const handleClear = () => {
    closeMonthYearPanel(DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID);
    onClear?.();
  };

  const handleClose = (newDate: Temporal.ZonedDateTime) => {
    closeMonthYearPanel(DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID);
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

  const handleDateChange = (newDate: Date | null) => {
    if (!isDefined(newDate)) {
      return;
    }
    const { zonedDateTime } = getZonedDateTimeFromDatePicked(newDate);

    onChange?.(zonedDateTime);
  };

  const handleDateSelect = (newDate: Date | null) => {
    if (!isDefined(newDate)) {
      return;
    }
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

        date.setDate(1);

        date.setFullYear(plainDate.year);
        date.setMonth(plainDate.month - 1);

        date.setDate(plainDate.day);

        return date;
      })
    : [shiftedDateForReactDatePicker];

  const calendarStartDayNumber =
    convertFirstDayOfTheWeekToCalendarStartDayNumber(userFirstDayOfTheWeek);

  return (
    <StyledOuterWrapper>
      <StyledDatePickerContainer calendarDisabled={isRelative}>
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
            calendarStartDay={
              calendarStartDayNumber as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
            }
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
                  onAddMonth={handleAddMonth}
                  onSubtractMonth={handleSubtractMonth}
                  prevMonthButtonDisabled={prevMonthButtonDisabled}
                  nextMonthButtonDisabled={nextMonthButtonDisabled}
                  hideInput={hideHeaderInput}
                  onChangeMonth={handleChangeMonth}
                  onChangeYear={handleChangeYear}
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
              <StyledButtonContent>
                <MenuItemLeftContent LeftIcon={IconCalendarX} text={t`Clear`} />
              </StyledButtonContent>
            </StyledButtonContainer>
          </>
        )}
      </StyledDatePickerContainer>
    </StyledOuterWrapper>
  );
};
