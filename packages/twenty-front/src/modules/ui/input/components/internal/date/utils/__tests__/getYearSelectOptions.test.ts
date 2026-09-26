import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { getYearSelectOptions } from '@/ui/input/components/internal/date/utils/getYearSelectOptions';

describe('getYearSelectOptions', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-26T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should list 200 years around the current Gregorian year, latest first', () => {
    const options = getYearSelectOptions(CalendarSystem.GREGORIAN);

    expect(options).toHaveLength(200);
    expect(options[0].value).toBe(2076);
    expect(options[options.length - 1].value).toBe(1877);
  });

  it('should list years of the Persian calendar', () => {
    const options = getYearSelectOptions(CalendarSystem.PERSIAN);

    expect(options[0].value).toBe(1455);
    expect(options.some(({ value }) => value === 1405)).toBe(true);
  });
});
