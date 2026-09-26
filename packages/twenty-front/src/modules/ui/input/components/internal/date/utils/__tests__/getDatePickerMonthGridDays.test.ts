import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { getDatePickerMonthGridDays } from '@/ui/input/components/internal/date/utils/getDatePickerMonthGridDays';
import { Temporal } from 'temporal-polyfill';

const getDaysInMonth = (days: ReturnType<typeof getDatePickerMonthGridDays>) =>
  days.filter(({ isOutsideMonth }) => !isOutsideMonth);

describe('getDatePickerMonthGridDays', () => {
  it('should lay out a Gregorian month in full weeks starting on the given weekday', () => {
    const days = getDatePickerMonthGridDays({
      visibleMonthDate: Temporal.PlainDate.from('2024-03-12'),
      calendarSystem: CalendarSystem.GREGORIAN,
      firstDayOfTheWeekIsoNumber: 7,
    });

    expect(days).toHaveLength(42);
    expect(days[0].plainDate.toString()).toBe('2024-02-25');
    expect(days[0].isOutsideMonth).toBe(true);
    expect(days[5].plainDate.toString()).toBe('2024-03-01');
    expect(getDaysInMonth(days)).toHaveLength(31);
  });

  it('should honor a Monday week start', () => {
    const days = getDatePickerMonthGridDays({
      visibleMonthDate: Temporal.PlainDate.from('2024-04-01'),
      calendarSystem: CalendarSystem.GREGORIAN,
      firstDayOfTheWeekIsoNumber: 1,
    });

    expect(days).toHaveLength(35);
    expect(days[0].plainDate.toString()).toBe('2024-04-01');
  });

  it('should lay out the Persian month containing the visible date', () => {
    const days = getDatePickerMonthGridDays({
      visibleMonthDate: Temporal.PlainDate.from('2026-09-26'),
      calendarSystem: CalendarSystem.PERSIAN,
      firstDayOfTheWeekIsoNumber: 6,
    });

    const daysInMonth = getDaysInMonth(days);

    expect(daysInMonth).toHaveLength(30);
    expect(daysInMonth[0].plainDate.toString()).toBe('2026-09-23');
    expect(daysInMonth[0].dayOfMonth).toBe(1);
    expect(days[0].plainDate.dayOfWeek).toBe(6);
  });

  it('should lay out an Islamic month', () => {
    const daysInMonth = getDaysInMonth(
      getDatePickerMonthGridDays({
        visibleMonthDate: Temporal.PlainDate.from('2026-09-26'),
        calendarSystem: CalendarSystem.ISLAMIC,
        firstDayOfTheWeekIsoNumber: 7,
      }),
    );

    expect(daysInMonth[14].plainDate.toString()).toBe('2026-09-26');
    expect(daysInMonth[14].dayOfMonth).toBe(15);
  });
});
