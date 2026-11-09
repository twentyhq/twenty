import { stringifyPageLayoutFilterRelativeDateValue } from '@/page-layout/utils/stringifyPageLayoutFilterRelativeDateValue';
import { FirstDayOfTheWeek } from 'twenty-shared/types';

describe('stringifyPageLayoutFilterRelativeDateValue', () => {
  it('should leave out the timezone and week start of the editor', () => {
    expect(
      stringifyPageLayoutFilterRelativeDateValue({
        direction: 'THIS',
        amount: 1,
        unit: 'MONTH',
        timezone: 'Europe/Paris',
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      }),
    ).toBe('THIS_1_MONTH');
  });

  it('should keep the amount of a past or next period', () => {
    expect(
      stringifyPageLayoutFilterRelativeDateValue({
        direction: 'PAST',
        amount: 7,
        unit: 'DAY',
        timezone: 'UTC',
      }),
    ).toBe('PAST_7_DAY');
  });
});
