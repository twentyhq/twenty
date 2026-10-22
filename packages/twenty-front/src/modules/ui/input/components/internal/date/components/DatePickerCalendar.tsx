import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { DropdownCleanupEffect } from '@/ui/layout/dropdown/components/DropdownCleanupEffect';
import { useHandleDropdownOpenChange } from '@/ui/layout/dropdown/hooks/useHandleDropdownOpenChange';
import { getDatePickerDropdownIds } from '@/ui/input/components/internal/date/utils/getDatePickerDropdownIds';
import { t } from '@lingui/core/macro';
import { useRef, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { convertFirstDayOfTheWeekToCalendarStartDayNumber } from 'twenty-shared/utils';
import {
  DateCalendar,
  type DateCalendarProps,
} from 'twenty-ui/components/input';

type DatePickerCalendarProps = {
  instanceId: string;
  value: string | null;
  onChange?: (date: string) => void;
  highlightedRange?: { start: string; end: string };
  readOnly?: boolean;
  hideGrid?: boolean;
  today?: string;
  onViewedMonthChange?: (month: string) => void;
};

export const DatePickerCalendar = ({
  instanceId,
  value,
  onChange,
  highlightedRange,
  readOnly,
  hideGrid,
  today,
  onViewedMonthChange,
}: DatePickerCalendarProps) => {
  const portalContainerRef = useRef<HTMLDivElement>(null);
  const { monthSelectDropdownId, yearSelectDropdownId } =
    getDatePickerDropdownIds(instanceId);
  const { handleDropdownOpenChange: handleMonthOpenChange } =
    useHandleDropdownOpenChange({ dropdownId: monthSelectDropdownId });
  const { handleDropdownOpenChange: handleYearOpenChange } =
    useHandleDropdownOpenChange({ dropdownId: yearSelectDropdownId });
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();
  const { userTimezone } = useUserTimezone();
  const currentToday =
    today ?? Temporal.Now.plainDateISO(userTimezone).toString();
  const referenceDate = highlightedRange?.start ?? value ?? currentToday;
  const [calendarState, setCalendarState] = useState({
    referenceDate,
    viewedMonth: referenceDate.slice(0, 7),
  });

  if (calendarState.referenceDate !== referenceDate) {
    setCalendarState({ referenceDate, viewedMonth: referenceDate.slice(0, 7) });
  }

  return (
    <div ref={portalContainerRef}>
      <DateCalendar
        aria-label={t`Choose a date`}
        value={value}
        onValueChange={(date) => onChange?.(date)}
        viewedMonth={calendarState.viewedMonth}
        onViewedMonthChange={(month) => {
          setCalendarState({ referenceDate, viewedMonth: month });
          onViewedMonthChange?.(month);
        }}
        portalContainer={portalContainerRef}
        onNavigationOpenChange={({ open, control }) => {
          const handleOpenChange =
            control === 'month' ? handleMonthOpenChange : handleYearOpenChange;
          handleOpenChange(open);
        }}
        today={currentToday}
        weekStart={
          convertFirstDayOfTheWeekToCalendarStartDayNumber(
            userFirstDayOfTheWeek,
          ) as DateCalendarProps['weekStart']
        }
        locale={currentWorkspaceMember?.locale ?? SOURCE_LOCALE}
        previousMonthLabel={t`Previous month`}
        nextMonthLabel={t`Next month`}
        monthLabel={t`Month`}
        yearLabel={t`Year`}
        highlightedRange={highlightedRange}
        readOnly={readOnly}
        hideGrid={hideGrid}
      />
      <DropdownCleanupEffect dropdownId={monthSelectDropdownId} />
      <DropdownCleanupEffect dropdownId={yearSelectDropdownId} />
    </div>
  );
};
