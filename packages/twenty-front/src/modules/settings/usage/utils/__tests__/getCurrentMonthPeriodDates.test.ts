import { getCurrentMonthPeriodDates } from '@/settings/usage/utils/getCurrentMonthPeriodDates';

describe('getCurrentMonthPeriodDates', () => {
  it('spans the UTC calendar month', () => {
    expect(
      getCurrentMonthPeriodDates(new Date('2026-10-20T15:30:00.000Z')),
    ).toEqual({
      periodStart: '2026-10-01T00:00:00.000Z',
      periodEnd: '2026-11-01T00:00:00.000Z',
    });
  });

  it('rolls over to the next year in December', () => {
    expect(
      getCurrentMonthPeriodDates(new Date('2026-12-31T23:59:59.999Z')),
    ).toEqual({
      periodStart: '2026-12-01T00:00:00.000Z',
      periodEnd: '2027-01-01T00:00:00.000Z',
    });
  });
});
