import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { Temporal } from 'temporal-polyfill';
import { getCalendarMonthGridDays } from '~/utils/dates/getCalendarMonthGridDays';

describe('getCalendarMonthGridDays', () => {
  it('should lay out a Gregorian month in full weeks starting on Sunday', () => {
    const days = getCalendarMonthGridDays({
      date: Temporal.PlainDate.from('2024-03-12'),
      calendarSystem: CalendarSystem.GREGORIAN,
      weekStartsOnDayIndex: 0,
    });

    expect(days).toHaveLength(42);
    expect(days[0].toString()).toBe('2024-02-25');
    expect(days[5].toString()).toBe('2024-03-01');
    expect(days[41].toString()).toBe('2024-04-06');
  });

  it('should honor a Monday week start', () => {
    const days = getCalendarMonthGridDays({
      date: Temporal.PlainDate.from('2024-04-01'),
      calendarSystem: CalendarSystem.GREGORIAN,
      weekStartsOnDayIndex: 1,
    });

    expect(days).toHaveLength(35);
    expect(days[0].toString()).toBe('2024-04-01');
  });

  it('should lay out the Persian month containing the date', () => {
    const days = getCalendarMonthGridDays({
      date: Temporal.PlainDate.from('2026-09-26'),
      calendarSystem: CalendarSystem.PERSIAN,
      weekStartsOnDayIndex: 6,
    });

    const daysInMonth = days.filter(
      (day) => day.withCalendar(CalendarSystem.PERSIAN).month === 7,
    );

    expect(days[0].dayOfWeek).toBe(6);
    expect(daysInMonth).toHaveLength(30);
    expect(daysInMonth[0].toString()).toBe('2026-09-23');
  });

  it('should lay out an Islamic month', () => {
    const days = getCalendarMonthGridDays({
      date: Temporal.PlainDate.from('2026-09-26'),
      calendarSystem: CalendarSystem.ISLAMIC,
      weekStartsOnDayIndex: 0,
    });

    const firstDayOfMonth = days.find(
      (day) => day.withCalendar(CalendarSystem.ISLAMIC).day === 1,
    );

    expect(
      firstDayOfMonth?.withCalendar(CalendarSystem.ISLAMIC).month,
    ).toBe(4);
    expect(days.every((day) => day.calendarId === 'iso8601')).toBe(true);
  });
});
