import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { detectCalendarSystem } from '@/localization/utils/detection/detectCalendarSystem';

export const resolveCalendarSystem = (
  calendarSystem: CalendarSystem,
): CalendarSystem => {
  if (calendarSystem === CalendarSystem.SYSTEM) {
    return CalendarSystem[detectCalendarSystem()];
  }

  return calendarSystem;
};
