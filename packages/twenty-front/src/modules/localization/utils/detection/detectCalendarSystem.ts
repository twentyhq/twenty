import { type CalendarSystem } from '@/localization/constants/CalendarSystem';

export const detectCalendarSystem = (): Exclude<
  keyof typeof CalendarSystem,
  'SYSTEM'
> => {
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
