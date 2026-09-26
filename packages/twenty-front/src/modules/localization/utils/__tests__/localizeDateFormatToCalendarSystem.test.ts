import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { localizeDateFormatToCalendarSystem } from '@/localization/utils/localizeDateFormatToCalendarSystem';
import { format } from 'date-fns';
import { Temporal } from 'temporal-polyfill';

const PLAIN_DATE = Temporal.PlainDate.from('2026-09-26');

const formatInCalendar = (
  dateFormat: string,
  calendarSystem: CalendarSystem,
  localeCode = 'en-US',
) =>
  format(
    new Date(2026, 8, 26, 14, 5),
    localizeDateFormatToCalendarSystem({
      dateFormat,
      plainDate: PLAIN_DATE,
      calendarSystem,
      localeCode,
    }),
  );

describe('localizeDateFormatToCalendarSystem', () => {
  it('should leave the format untouched for the Gregorian calendar', () => {
    expect(
      localizeDateFormatToCalendarSystem({
        dateFormat: 'MMM d, yyyy',
        plainDate: PLAIN_DATE,
        calendarSystem: CalendarSystem.GREGORIAN,
      }),
    ).toBe('MMM d, yyyy');
  });

  it('should render year, month and day in the Persian calendar', () => {
    expect(formatInCalendar('MMM d, yyyy', CalendarSystem.PERSIAN)).toBe(
      'Mehr 4, 1405',
    );
    expect(formatInCalendar('yyyy-MM-dd', CalendarSystem.PERSIAN)).toBe(
      '1405-07-04',
    );
    expect(formatInCalendar('d MMMM yy', CalendarSystem.PERSIAN)).toBe(
      '4 Mehr 05',
    );
  });

  it('should render year, month and day in the Islamic calendar', () => {
    expect(formatInCalendar('yyyy/M/d', CalendarSystem.ISLAMIC)).toBe(
      '1448/4/15',
    );
  });

  it('should localize month names to the given locale', () => {
    expect(formatInCalendar('d MMMM', CalendarSystem.PERSIAN, 'fa-IR')).toBe(
      '4 مهر',
    );
  });

  it('should keep calendar-independent tokens and quoted text for date-fns', () => {
    expect(
      formatInCalendar("EEE d MMM 'at' HH:mm", CalendarSystem.PERSIAN),
    ).toBe('Sat 4 Mehr at 14:05');
  });

  it('should keep quoted text containing escaped quotes and letters', () => {
    expect(formatInCalendar("d 'day''s' yyyy", CalendarSystem.PERSIAN)).toBe(
      "4 day's 1405",
    );
  });
});
