import { type CalendarSystem } from '@/localization/constants/CalendarSystem';

export const detectCalendarSystem = (): keyof typeof CalendarSystem => {
  try {
    const calendar = new Intl.DateTimeFormat(
      navigator?.language || 'en-US',
    ).resolvedOptions().calendar;

    if (calendar === 'persian') return 'PERSIAN';
    if (calendar.startsWith('islamic')) return 'ISLAMIC';

    return 'GREGORIAN';
  } catch {
    return 'GREGORIAN';
  }
};
