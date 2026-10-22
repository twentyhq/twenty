import { doNotTranslate } from 'twenty-shared/i18n';
import {
  isDefined,
  isSubDayRelativeDateFilterUnit,
  type RelativeDateFilter,
} from 'twenty-shared/utils';
import { Temporal } from 'temporal-polyfill';

import { DatePickerCalendar } from '@/ui/input/components/internal/date/components/DatePickerCalendar';
import { DatePickerClearButton } from '@/ui/input/components/internal/date/components/DatePickerClearButton';
import { DateTimePickerHeader } from '@/ui/input/components/internal/date/components/DateTimePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { RelativeDateTimeRangeText } from '@/ui/input/components/internal/date/components/RelativeDateTimeRangeText';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
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
  const resolvedTimeZone = timeZone ?? userTimezone;
  const dateToUse = (
    date ?? Temporal.Now.zonedDateTimeISO(resolvedTimeZone)
  ).withTimeZone(resolvedTimeZone);
  const today = Temporal.Now.zonedDateTimeISO(resolvedTimeZone)
    .toPlainDate()
    .toString();
  const relativeUnit = relativeDate?.unit ?? doNotTranslate('DAY');
  const relativeRangeStart = isRelative ? relativeDate?.start : undefined;
  const relativeRangeEnd = isRelative ? relativeDate?.end : undefined;
  const relativeRangeStartDate = relativeRangeStart
    ?.withTimeZone(resolvedTimeZone)
    .toPlainDate()
    .toString();
  const relativeRangeEndDate = relativeRangeEnd
    ?.subtract({ nanoseconds: 1 })
    .withTimeZone(resolvedTimeZone)
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

  const handleDateChange = (plainDate: string) => {
    const selectedDate = Temporal.PlainDate.from(plainDate).toZonedDateTime({
      timeZone: resolvedTimeZone,
      plainTime: dateToUse.toPlainTime(),
    });

    onChange?.(selectedDate);
    onClose?.(selectedDate);
  };

  return (
    <StyledDatePickerContainer>
      {isRelative ? (
        <RelativeDatePickerHeader
          instanceId={instanceId}
          direction={relativeDate?.direction ?? 'PAST'}
          amount={relativeDate?.amount}
          unit={relativeUnit}
          onChange={onRelativeDateChange}
          allowIntraDayUnits
        />
      ) : (
        <DateTimePickerHeader
          date={dateToUse}
          onChange={onChange}
          hideInput={hideHeaderInput}
          timeZone={resolvedTimeZone}
        />
      )}
      {isSubDayRelativeUnit ? (
        isDefined(relativeRangeStart) &&
        isDefined(relativeRangeEnd) && (
          <RelativeDateTimeRangeText
            start={relativeRangeStart.withTimeZone(resolvedTimeZone)}
            end={relativeRangeEnd.withTimeZone(resolvedTimeZone)}
          />
        )
      ) : (
        <DatePickerCalendar
          instanceId={instanceId}
          value={isRelative ? null : dateToUse.toPlainDate().toString()}
          onChange={handleDateChange}
          highlightedRange={highlightedRange}
          readOnly={isRelative === true}
          today={today}
        />
      )}
      {clearable && <DatePickerClearButton onClear={onClear} />}
    </StyledDatePickerContainer>
  );
};
