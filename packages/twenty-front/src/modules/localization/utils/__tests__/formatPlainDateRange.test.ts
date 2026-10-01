import { formatPlainDateRange } from '@/localization/utils/formatPlainDateRange';
import { enUS } from 'date-fns/locale';
import { Temporal } from 'temporal-polyfill';

describe('formatPlainDateRange', () => {
  it('formats a range within one month', () => {
    expect(
      formatPlainDateRange({
        firstDay: Temporal.PlainDate.from('2026-07-06'),
        lastDay: Temporal.PlainDate.from('2026-07-12'),
        locale: enUS,
      }),
    ).toBe('Jul 6 – 12, 2026');
  });

  it('formats a range spanning two months', () => {
    expect(
      formatPlainDateRange({
        firstDay: Temporal.PlainDate.from('2026-06-29'),
        lastDay: Temporal.PlainDate.from('2026-07-05'),
        locale: enUS,
      }),
    ).toBe('Jun 29 – Jul 5, 2026');
  });

  it('formats a range spanning two years', () => {
    expect(
      formatPlainDateRange({
        firstDay: Temporal.PlainDate.from('2025-12-29'),
        lastDay: Temporal.PlainDate.from('2026-01-04'),
        locale: enUS,
      }),
    ).toBe('Dec 29, 2025 – Jan 4, 2026');
  });
});
