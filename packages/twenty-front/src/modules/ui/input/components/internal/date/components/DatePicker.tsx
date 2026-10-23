import { DatePickerCalendar } from '@/ui/input/components/internal/date/components/DatePickerCalendar';
import { DatePickerLoadingFallback } from '@/ui/input/components/internal/date/components/DatePickerLoadingFallback';
import { DatePickerClearButton } from '@/ui/input/components/internal/date/components/DatePickerClearButton';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  isDefined,
  turnPlainDateToShiftedDateInSystemTimeZone,
  type RelativeDateFilter,
} from 'twenty-shared/utils';

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
  const plainDate = isDefined(plainDateString)
    ? Temporal.PlainDate.from(plainDateString)
    : Temporal.Now.plainDateISO();
  const highlightedRange =
    isRelative && isDefined(relativeDate)
      ? {
          start: relativeDate.start,
          end: Temporal.PlainDate.from(relativeDate.end)
            .subtract({ days: 1 })
            .toString(),
        }
      : undefined;

  return (
    <StyledDatePickerContainer>
      <DatePickerCalendar
        loadingFallback={<DatePickerLoadingFallback />}
        value={isRelative ? null : plainDate.toString()}
        onChange={onChange}
        onSelect={onClose}
        highlightedRange={highlightedRange}
        readOnly={isRelative}
        renderHeader={(header) => {
          if (isRelative) {
            return (
              <RelativeDatePickerHeader
                instanceId={instanceId}
                direction={relativeDate?.direction ?? 'PAST'}
                amount={relativeDate?.amount}
                unit={relativeDate?.unit ?? doNotTranslate('DAY')}
                onChange={onRelativeDateChange}
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
            <DatePickerHeader
              instanceId={instanceId}
              date={plainDate.toString()}
              viewedMonth={header.viewedMonth}
              onChange={onChange}
              onChangeMonth={header.onMonthChange}
              onChangeYear={header.onYearChange}
              onAddMonth={header.onNextMonth}
              onSubtractMonth={header.onPreviousMonth}
              prevMonthButtonDisabled={header.isPreviousMonthDisabled}
              nextMonthButtonDisabled={header.isNextMonthDisabled}
              hideInput={hideHeaderInput}
            />
          );
        }}
      />
      {clearable && <DatePickerClearButton onClear={onClear} />}
    </StyledDatePickerContainer>
  );
};
