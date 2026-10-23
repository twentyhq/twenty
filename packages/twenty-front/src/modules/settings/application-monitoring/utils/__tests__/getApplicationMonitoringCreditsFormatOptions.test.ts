import { getApplicationMonitoringCreditsFormatOptions } from '@/settings/application-monitoring/utils/getApplicationMonitoringCreditsFormatOptions';

const formatCredits = (creditsUsed: number) =>
  new Intl.NumberFormat(
    'en-US',
    getApplicationMonitoringCreditsFormatOptions(creditsUsed),
  ).format(creditsUsed);

describe('getApplicationMonitoringCreditsFormatOptions', () => {
  it('should keep significant digits below a hundredth of a credit', () => {
    expect(formatCredits(0.00349)).toBe('0.0034');
  });

  it('should truncate to two decimals below ten credits', () => {
    expect(formatCredits(0)).toBe('0');
    expect(formatCredits(2.459)).toBe('2.45');
  });

  it('should drop decimals from ten credits', () => {
    expect(formatCredits(1234.9)).toBe('1,234');
  });
});
