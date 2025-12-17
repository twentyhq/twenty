import { isBarChartConfiguration } from '../isBarChartConfiguration';

describe('isBarChartConfiguration', () => {
  it('should return true for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration' as const,
    };

    expect(isBarChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration' as const,
    };

    expect(isBarChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration' as const,
    };

    expect(isBarChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for AggregateChartConfiguration', () => {
    const configuration = {
      __typename: 'AggregateChartConfiguration' as const,
    };

    expect(isBarChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for GaugeChartConfiguration', () => {
    const configuration = {
      __typename: 'GaugeChartConfiguration' as const,
    };

    expect(isBarChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBarChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBarChartConfiguration(undefined)).toBe(false);
  });
});
