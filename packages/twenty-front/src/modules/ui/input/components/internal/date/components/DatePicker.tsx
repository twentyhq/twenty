import { DatePickerCalendar } from '@/ui/input/components/internal/date/components/DatePickerCalendar';
import { DatePickerClearButton } from '@/ui/input/components/internal/date/components/DatePickerClearButton';
import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, type RelativeDateFilter } from 'twenty-shared/utils';

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
  isRelative = false,
  relativeDate,
  onRelativeDateChange,
  hideHeaderInput,
  hideCalendar,
}: DatePickerProps) => {
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
      {isRelative ? (
        <RelativeDatePickerHeader
          instanceId={instanceId}
          direction={relativeDate?.direction ?? 'PAST'}
          amount={relativeDate?.amount}
          unit={relativeDate?.unit ?? doNotTranslate('DAY')}
          onChange={onRelativeDateChange}
        />
      ) : (
        !hideHeaderInput && (
          <DatePickerInput date={plainDateString ?? null} onChange={onChange} />
        )
      )}
      <DatePickerCalendar
        instanceId={instanceId}
        value={isRelative ? null : (plainDateString ?? null)}
        onChange={(date) => {
          onChange?.(date);
          onClose?.(date);
        }}
        highlightedRange={highlightedRange}
        readOnly={isRelative}
        hideGrid={hideCalendar}
      />
      {clearable && <DatePickerClearButton onClear={onClear} />}
    </StyledDatePickerContainer>
  );
};
