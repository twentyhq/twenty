import { formatRecordCalendarWeekRange } from '@/object-record/record-calendar/week/utils/formatRecordCalendarWeekRange';
import { enUS } from 'date-fns/locale';
import { Temporal } from 'temporal-polyfill';

describe('formatRecordCalendarWeekRange', () => {
  it('formats a week within one month', () => {
    expect(
      formatRecordCalendarWeekRange({
        firstDayOfWeek: Temporal.PlainDate.from('2026-07-06'),
        lastDayOfWeek: Temporal.PlainDate.from('2026-07-12'),
        locale: enUS,
      }),
    ).toBe('Jul 6 – 12, 2026');
  });

  it('formats a week spanning two months', () => {
    expect(
      formatRecordCalendarWeekRange({
        firstDayOfWeek: Temporal.PlainDate.from('2026-06-29'),
        lastDayOfWeek: Temporal.PlainDate.from('2026-07-05'),
        locale: enUS,
      }),
    ).toBe('Jun 29 – Jul 5, 2026');
  });

  it('formats a week spanning two years', () => {
    expect(
      formatRecordCalendarWeekRange({
        firstDayOfWeek: Temporal.PlainDate.from('2025-12-29'),
        lastDayOfWeek: Temporal.PlainDate.from('2026-01-04'),
        locale: enUS,
      }),
    ).toBe('Dec 29, 2025 – Jan 4, 2026');
  });
});
