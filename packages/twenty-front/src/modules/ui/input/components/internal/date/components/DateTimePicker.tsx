import { doNotTranslate } from 'twenty-shared/i18n';
import {
  convertFirstDayOfTheWeekToCalendarStartDayNumber,
  isDefined,
  isSubDayRelativeDateFilterUnit,
  turnJSDateToPlainDate,
  turnPlainDateToShiftedDateInSystemTimeZone,
  type RelativeDateFilter,
} from 'twenty-shared/utils';
import { Temporal } from 'temporal-polyfill';

import { DatePickerCalendar } from '@/ui/input/components/internal/date/components/DatePickerCalendar';
import { DatePickerClearButton } from '@/ui/input/components/internal/date/components/DatePickerClearButton';
import { DateTimePickerHeader } from '@/ui/input/components/internal/date/components/DateTimePickerHeader';
import { DateTimePickerLoadingFallback } from '@/ui/input/components/internal/date/components/DateTimePickerLoadingFallback';
import { useGetShiftedDateToSystemTimeZone } from '@/ui/input/components/internal/date/hooks/useGetShiftedDateToSystemTimeZone';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { RelativeDateTimeRangeText } from '@/ui/input/components/internal/date/components/RelativeDateTimeRangeText';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

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
  const { userTimezone } = useUserTimezone();
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();
  const resolvedTimeZone = timeZone ?? userTimezone;
  const dateToUse = date ?? Temporal.Now.zonedDateTimeISO(resolvedTimeZone);
  const { getShiftedDateToSystemTimeZone } =
    useGetShiftedDateToSystemTimeZone();
  const selectedCalendarDate = getShiftedDateToSystemTimeZone(
    new Date(dateToUse.toInstant().toString()),
    resolvedTimeZone,
  );
  const selectedCalendarValue =
    turnJSDateToPlainDate(selectedCalendarDate).toString();
  const hasSelectedCalendarTime =
    selectedCalendarDate.getHours() !== 0 ||
    selectedCalendarDate.getMinutes() !== 0 ||
    selectedCalendarDate.getSeconds() !== 0 ||
    selectedCalendarDate.getMilliseconds() !== 0;
  const relativeUnit = relativeDate?.unit ?? doNotTranslate('DAY');
  const relativeRangeStart = isRelative ? relativeDate?.start : undefined;
  const relativeRangeEnd = isRelative ? relativeDate?.end : undefined;
  const relativeRangeStartDate = relativeRangeStart?.toPlainDate().toString();
  const relativeRangeEndDate = relativeRangeEnd
    ?.subtract({ nanoseconds: 1 })
    .toPlainDate()
    .toString();
  const highlightedRange = isDefined(relativeRangeStartDate)
    ? {
        start: relativeRangeStartDate,
        end: relativeRangeEndDate ?? relativeRangeStartDate,
      }
    : undefined;
  const isSubDayRelativeUnit =
    isRelative === true && isSubDayRelativeDateFilterUnit(relativeUnit);
  const getZonedDateTimeFromDatePicked = (datePicked: string) =>
    Temporal.PlainDate.from(datePicked)
      .toZonedDateTime(resolvedTimeZone)
      .with({ hour: dateToUse.hour, minute: dateToUse.minute });

  const handleDateSelect = (datePicked: string) => {
    const selectedDate = getZonedDateTimeFromDatePicked(datePicked);
    const isSameCalendarDay = datePicked === selectedCalendarValue;

    if (isSameCalendarDay && hasSelectedCalendarTime) {
      onChange?.(selectedDate);
    }

    onClose?.(selectedDate);
  };

  return (
    <StyledDatePickerContainer>
      {isSubDayRelativeUnit ? (
        <>
          <RelativeDatePickerHeader
            instanceId={instanceId}
            direction={relativeDate?.direction ?? 'PAST'}
            amount={relativeDate?.amount}
            unit={relativeUnit}
            onChange={onRelativeDateChange}
            allowIntraDayUnits
          />
          {isDefined(relativeRangeStart) && isDefined(relativeRangeEnd) && (
            <RelativeDateTimeRangeText
              start={relativeRangeStart}
              end={relativeRangeEnd}
            />
          )}
        </>
      ) : (
        <DatePickerCalendar
          loadingFallback={<DateTimePickerLoadingFallback />}
          value={isRelative ? null : selectedCalendarValue}
          onChange={(datePicked) =>
            onChange?.(getZonedDateTimeFromDatePicked(datePicked))
          }
          onSelect={handleDateSelect}
          highlightedRange={highlightedRange}
          readOnly={isRelative}
          weekStart={convertFirstDayOfTheWeekToCalendarStartDayNumber(
            userFirstDayOfTheWeek,
          )}
          renderHeader={(header) => {
            if (isRelative) {
              return (
                <RelativeDatePickerHeader
                  instanceId={instanceId}
                  direction={relativeDate?.direction ?? 'PAST'}
                  amount={relativeDate?.amount}
                  unit={relativeUnit}
                  onChange={onRelativeDateChange}
                  allowIntraDayUnits
                  calendarMonthDate={turnPlainDateToShiftedDateInSystemTimeZone(
                    Temporal.PlainDate.from(`${header.viewedMonth}-01`),
                  )}
                  onPreviousMonth={header.onPreviousMonth}
                  onNextMonth={header.onNextMonth}
                  prevMonthButtonDisabled={header.isPreviousMonthDisabled}
                  nextMonthButtonDisabled={header.isNextMonthDisabled}
                />
              );
            }

            return (
              <DateTimePickerHeader
                instanceId={instanceId}
                date={dateToUse}
                viewedMonth={header.viewedMonth}
                onChange={onChange}
                onAddMonth={header.onNextMonth}
                onSubtractMonth={header.onPreviousMonth}
                prevMonthButtonDisabled={header.isPreviousMonthDisabled}
                nextMonthButtonDisabled={header.isNextMonthDisabled}
                hideInput={hideHeaderInput}
                onChangeMonth={header.onMonthChange}
                onChangeYear={header.onYearChange}
              />
            );
          }}
        />
      )}
      {clearable && <DatePickerClearButton onClear={onClear} />}
    </StyledDatePickerContainer>
  );
};
