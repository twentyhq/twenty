import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';

describe('getMonthSelectOptions', () => {
  it('should list the Gregorian months', () => {
    const options = getMonthSelectOptions({
      locale: 'en-US',
      calendarSystem: CalendarSystem.GREGORIAN,
      calendarYear: 2024,
    });

    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ label: 'January', value: 1 });
    expect(options[11]).toEqual({ label: 'December', value: 12 });
  });

  it('should list the Persian months', () => {
    const options = getMonthSelectOptions({
      locale: 'en-US',
      calendarSystem: CalendarSystem.PERSIAN,
      calendarYear: 1405,
    });

    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ label: 'Farvardin', value: 1 });
    expect(options[6]).toEqual({ label: 'Mehr', value: 7 });
  });
});
