import { isGaugeChartConfiguration } from '../isGaugeChartConfiguration';

describe('isGaugeChartConfiguration', () => {
  it('should return true for GaugeChartConfiguration', () => {
    const configuration = {
      __typename: 'GaugeChartConfiguration' as const,
    };

    expect(isGaugeChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration' as const,
    };

    expect(isGaugeChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration' as const,
    };

    expect(isGaugeChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration' as const,
    };

    expect(isGaugeChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for AggregateChartConfiguration', () => {
    const configuration = {
      __typename: 'AggregateChartConfiguration' as const,
    };

    expect(isGaugeChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isGaugeChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isGaugeChartConfiguration(undefined)).toBe(false);
  });
});
