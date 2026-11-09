import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDatePickerWeekStartOrThrow } from '@/ui/input/components/internal/date/utils/getDatePickerWeekStartOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { DatePicker, type DatePickerProps } from 'twenty-ui/components/input';
import { useLingui } from '@lingui/react/macro';

type DatePickerCalendarProps = {
  value: string | null;
  onChange?: (date: string) => void;
  onSelect?: (date: string) => void;
  highlightedRange?: { start: string; end: string };
  viewedDate?: string | null;
  readOnly?: boolean;
  isGridHidden?: boolean;
  today?: string;
  weekStart?: DatePickerProps['weekStart'];
  onViewedMonthChange?: (month: string) => void;
  renderHeader?: DatePickerProps['renderHeader'];
  loadingFallback?: DatePickerProps['loadingFallback'];
};

export const DatePickerCalendar = ({
  value,
  onChange,
  onSelect,
  highlightedRange,
  viewedDate,
  readOnly,
  isGridHidden,
  today,
  weekStart,
  onViewedMonthChange,
  renderHeader,
  loadingFallback,
}: DatePickerCalendarProps) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentToday = today ?? Temporal.Now.plainDateISO().toString();
  const referenceDate =
    viewedDate ?? highlightedRange?.start ?? value ?? currentToday;
  const referenceKey = isDefined(highlightedRange)
    ? `${highlightedRange.start}-${highlightedRange.end}`
    : referenceDate;
  const [calendarState, setCalendarState] = useState({
    referenceKey,
    viewedMonth: referenceDate.slice(0, 7),
  });
  if (calendarState.referenceKey !== referenceKey) {
    setCalendarState({ referenceKey, viewedMonth: referenceDate.slice(0, 7) });
  }

  return (
    <DatePicker
      aria-label={t`Choose a date`}
      value={value}
      onValueChange={(date) => onChange?.(date)}
      onValueSelect={onSelect}
      viewedMonth={calendarState.viewedMonth}
      onViewedMonthChange={(month) => {
        setCalendarState({ referenceKey, viewedMonth: month });
        onViewedMonthChange?.(month);
      }}
      weekStart={
        weekStart ??
        getDatePickerWeekStartOrThrow(currentWorkspaceMember?.calendarStartDay)
      }
      locale={SOURCE_LOCALE}
      previousMonthLabel={t`Previous`}
      nextMonthLabel={t`Next`}
      monthLabel={t`Month`}
      yearLabel={t`Year`}
      highlightedRange={highlightedRange}
      readOnly={readOnly}
      isGridHidden={isGridHidden}
      isKeyboardNavigationDisabled
      renderHeader={renderHeader}
      loadingFallback={loadingFallback}
    />
  );
};
