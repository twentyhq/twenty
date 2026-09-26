import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { detectCalendarSystem } from '@/localization/utils/detection/detectCalendarSystem';

export const resolveCalendarSystem = (
  calendarSystem: CalendarSystem,
): Exclude<CalendarSystem, CalendarSystem.SYSTEM> => {
  if (calendarSystem === CalendarSystem.SYSTEM) {
    return CalendarSystem[detectCalendarSystem()];
  }

  return calendarSystem;
};
