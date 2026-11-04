import { getApplicationMonitoringChartValueFormat } from '@/settings/application-monitoring/utils/getApplicationMonitoringChartValueFormat';

describe('getApplicationMonitoringChartValueFormat', () => {
  it('should format counts without decimals', () => {
    expect(
      getApplicationMonitoringChartValueFormat({
        hasIntegerValues: true,
        maxValue: 0,
      }),
    ).toBe('>-,.0f');
  });

  it('should keep significant digits when every value is below one', () => {
    expect(
      getApplicationMonitoringChartValueFormat({
        hasIntegerValues: false,
        maxValue: 0.004,
      }),
    ).toBe('>-,.2~r');
  });

  it('should keep two decimals for larger values', () => {
    expect(
      getApplicationMonitoringChartValueFormat({
        hasIntegerValues: false,
        maxValue: 3.5,
      }),
    ).toBe('>-,.2~f');
  });
});
