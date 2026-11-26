import { getAdminUsageLimitPeriodLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitPeriodLabel';

describe('getAdminUsageLimitPeriodLabel', () => {
  it('shows a one-day window in seconds as a day', () => {
    expect(
      getAdminUsageLimitPeriodLabel({
        periodCount: 86_400,
        periodUnit: 'second',
      }),
    ).toBe('Day');
  });

  it('keeps a window shorter than a day in seconds', () => {
    expect(
      getAdminUsageLimitPeriodLabel({ periodCount: 60, periodUnit: 'second' }),
    ).toBe('60 Seconds');
  });
});
