import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { Temporal } from 'temporal-polyfill';

const YEARS_BEFORE_CURRENT_YEAR = 149;
const YEARS_AFTER_CURRENT_YEAR = 50;

export const getYearSelectOptions = (
  calendarSystem: CalendarSystem,
): { label: string; value: number }[] => {
  const currentCalendarYear =
    Temporal.Now.plainDateISO().withCalendar(calendarSystem).year;

  return Array.from(
    { length: YEARS_BEFORE_CURRENT_YEAR + YEARS_AFTER_CURRENT_YEAR + 1 },
    (_, index) => currentCalendarYear + YEARS_AFTER_CURRENT_YEAR - index,
  ).map((year) => ({ label: year.toString(), value: year }));
};
