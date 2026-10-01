import { getPlainDateStartOfWeek } from '@/localization/utils/getPlainDateStartOfWeek';
import { Temporal } from 'temporal-polyfill';

const SUNDAY = 0;
const MONDAY = 1;

describe('getPlainDateStartOfWeek', () => {
  it('returns the previous Monday when weeks start on Monday', () => {
    expect(
      getPlainDateStartOfWeek({
        day: Temporal.PlainDate.from('2026-10-01'),
        weekStartsOnDayIndex: MONDAY,
      }).toString(),
    ).toBe('2026-09-28');
  });

  it('returns the previous Sunday when weeks start on Sunday', () => {
    expect(
      getPlainDateStartOfWeek({
        day: Temporal.PlainDate.from('2026-10-01'),
        weekStartsOnDayIndex: SUNDAY,
      }).toString(),
    ).toBe('2026-09-27');
  });

  it('returns the same day when it is the start of the week', () => {
    expect(
      getPlainDateStartOfWeek({
        day: Temporal.PlainDate.from('2026-09-27'),
        weekStartsOnDayIndex: SUNDAY,
      }).toString(),
    ).toBe('2026-09-27');
  });
});
