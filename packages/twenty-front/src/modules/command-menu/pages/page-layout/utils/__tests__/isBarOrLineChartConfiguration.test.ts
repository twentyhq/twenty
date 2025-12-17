import { isBarOrLineChartConfiguration } from '../isBarOrLineChartConfiguration';

describe('isBarOrLineChartConfiguration', () => {
  it('should return true for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration' as const,
    };

    expect(isBarOrLineChartConfiguration(configuration)).toBe(true);
  });

  it('should return true for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration' as const,
    };

    expect(isBarOrLineChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration' as const,
    };

    expect(isBarOrLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for AggregateChartConfiguration', () => {
    const configuration = {
      __typename: 'AggregateChartConfiguration' as const,
    };

    expect(isBarOrLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for GaugeChartConfiguration', () => {
    const configuration = {
      __typename: 'GaugeChartConfiguration' as const,
    };

    expect(isBarOrLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBarOrLineChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBarOrLineChartConfiguration(undefined)).toBe(false);
  });
});
