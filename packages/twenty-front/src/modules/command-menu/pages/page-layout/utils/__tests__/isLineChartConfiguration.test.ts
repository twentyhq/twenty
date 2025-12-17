import { isLineChartConfiguration } from '../isLineChartConfiguration';

describe('isLineChartConfiguration', () => {
  it('should return true for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration' as const,
    };

    expect(isLineChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration' as const,
    };

    expect(isLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration' as const,
    };

    expect(isLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for AggregateChartConfiguration', () => {
    const configuration = {
      __typename: 'AggregateChartConfiguration' as const,
    };

    expect(isLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for GaugeChartConfiguration', () => {
    const configuration = {
      __typename: 'GaugeChartConfiguration' as const,
    };

    expect(isLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isLineChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isLineChartConfiguration(undefined)).toBe(false);
  });
});
