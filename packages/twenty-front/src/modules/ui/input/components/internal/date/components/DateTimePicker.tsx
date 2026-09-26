import {
  isDefined,
  isSubDayRelativeDateFilterUnit,
  type RelativeDateFilter,
} from 'twenty-shared/utils';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DatePickerMonthGrid } from '@/ui/input/components/internal/date/components/DatePickerMonthGrid';
import {
  DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID,
  DateTimePickerHeader,
} from '@/ui/input/components/internal/date/components/DateTimePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { RelativeDateTimeRangeText } from '@/ui/input/components/internal/date/components/RelativeDateTimeRangeText';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { useRelativeDatePickerVisibleMonth } from '@/ui/input/components/internal/date/hooks/useRelativeDatePickerVisibleMonth';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Temporal } from 'temporal-polyfill';
import { IconCalendarX } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';

export {
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DatePicker';
export { DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID } from '@/ui/input/components/internal/date/components/DateTimePickerHeader';

import { useTheme, themeCssVariables } from 'twenty-ui/theme';

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
  const { calendarSystem } = useDateTimeFormat();

  const { userTimezone } = useUserTimezone();

  const dateToUse =
    date ?? Temporal.Now.zonedDateTimeISO(timeZone ?? userTimezone);
  const calendarDateToUse = dateToUse.withCalendar(calendarSystem);

  const { closeDropdown: closeMonthYearPanel } = useCloseDropdown();

  const handleClear = () => {
    closeMonthYearPanel(DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID);
    onClear?.();
  };

  const handleClose = (newDate: Temporal.ZonedDateTime) => {
    closeMonthYearPanel(DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID);
    onClose?.(newDate);
  };

  const changeToCalendarDate = (
    newCalendarZonedDateTime: Temporal.ZonedDateTime,
  ) => {
    onChange?.(newCalendarZonedDateTime.withCalendar('iso8601'));
  };

  const handleChangeMonth = (month: number) => {
    changeToCalendarDate(calendarDateToUse.with({ month }));
  };

  const handleAddMonth = () => {
    changeToCalendarDate(calendarDateToUse.add({ months: 1 }));
  };

  const handleSubtractMonth = () => {
    changeToCalendarDate(calendarDateToUse.subtract({ months: 1 }));
  };

  const handleChangeYear = (year: number) => {
    changeToCalendarDate(calendarDateToUse.with({ year }));
  };

  const handleDateClick = (plainDatePicked: Temporal.PlainDate) => {
    const zonedDateTime = plainDatePicked
      .toZonedDateTime(timeZone ?? userTimezone)
      .with({
        hour: dateToUse.hour,
        minute: dateToUse.minute,
      });

    onChange?.(zonedDateTime);
    handleClose(zonedDateTime);
  };

  const relativeUnit = relativeDate?.unit ?? 'DAY';
  const relativeRangeStart = isRelative ? relativeDate?.start : undefined;
  const relativeRangeEnd = isRelative ? relativeDate?.end : undefined;

  const isSubDayRelativeUnit =
    isRelative === true && isSubDayRelativeDateFilterUnit(relativeUnit);

  const relativeRangeStartPlainDate = isDefined(relativeRangeStart)
    ? relativeRangeStart.toPlainDate()
    : null;

  const relativeRangeEndPlainDate = isDefined(relativeRangeEnd)
    ? relativeRangeEnd.subtract({ nanoseconds: 1 }).toPlainDate()
    : null;

  const {
    visibleMonthDate: relativeVisibleMonthDate,
    showPreviousMonth,
    showNextMonth,
  } = useRelativeDatePickerVisibleMonth({
    rangeStartDate: relativeRangeStartPlainDate,
    rangeEndDate: relativeRangeEndPlainDate,
  });

  const selectedPlainDate = dateToUse
    .withTimeZone(timeZone ?? userTimezone)
    .toPlainDate();

  return (
    <StyledOuterWrapper>
      <StyledDatePickerContainer>
        {isSubDayRelativeUnit ? (
          <>
            <RelativeDatePickerHeader
              instanceId={instanceId}
              direction={relativeDate?.direction ?? 'PAST'}
              amount={relativeDate?.amount}
              unit={relativeUnit}
              onChange={onRelativeDateChange}
              allowIntraDayUnits={true}
            />
            {isDefined(relativeRangeStart) && isDefined(relativeRangeEnd) && (
              <RelativeDateTimeRangeText
                start={relativeRangeStart}
                end={relativeRangeEnd}
              />
            )}
          </>
        ) : (
          <>
            {isRelative ? (
              <RelativeDatePickerHeader
                instanceId={instanceId}
                direction={relativeDate?.direction ?? 'PAST'}
                amount={relativeDate?.amount}
                unit={relativeUnit}
                onChange={onRelativeDateChange}
                allowIntraDayUnits={true}
                calendarMonthDate={relativeVisibleMonthDate}
                onPreviousMonth={showPreviousMonth}
                onNextMonth={showNextMonth}
              />
            ) : (
              <DateTimePickerHeader
                date={dateToUse}
                onChange={onChange}
                onAddMonth={handleAddMonth}
                onSubtractMonth={handleSubtractMonth}
                hideInput={hideHeaderInput}
                onChangeMonth={handleChangeMonth}
                onChangeYear={handleChangeYear}
              />
            )}
            <DatePickerMonthGrid
              visibleMonthDate={
                isRelative ? relativeVisibleMonthDate : selectedPlainDate
              }
              selectedDate={isRelative ? null : selectedPlainDate}
              rangeStartDate={relativeRangeStartPlainDate}
              rangeEndDate={relativeRangeEndPlainDate}
              disabled={isRelative}
              onDateClick={handleDateClick}
            />
          </>
        )}
        {clearable && (
          <>
            <StyledSeparator />
            <StyledButtonContainer onClick={handleClear}>
              <StyledButtonContent>
                <IconCalendarX size={theme.icon.size.md} />
                <Text>{t`Clear`}</Text>
              </StyledButtonContent>
            </StyledButtonContainer>
          </>
        )}
      </StyledDatePickerContainer>
    </StyledOuterWrapper>
  );
};
