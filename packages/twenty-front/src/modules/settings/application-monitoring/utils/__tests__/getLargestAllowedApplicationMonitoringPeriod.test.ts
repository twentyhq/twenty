import { getLargestAllowedApplicationMonitoringPeriod } from '@/settings/application-monitoring/utils/getLargestAllowedApplicationMonitoringPeriod';

describe('getLargestAllowedApplicationMonitoringPeriod', () => {
  it('should keep a period within the lookback', () => {
    expect(
      getLargestAllowedApplicationMonitoringPeriod({
        period: '7d',
        lookbackInHours: 90 * 24,
      }),
    ).toBe('7d');
  });

  it('should fall back to the largest period a Pro plan can see', () => {
    expect(
      getLargestAllowedApplicationMonitoringPeriod({
        period: '7d',
        lookbackInHours: 2,
      }),
    ).toBe('2h');
  });
});
