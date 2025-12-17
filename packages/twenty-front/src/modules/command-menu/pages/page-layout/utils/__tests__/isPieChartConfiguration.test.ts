import { isPieChartConfiguration } from '../isPieChartConfiguration';

describe('isPieChartConfiguration', () => {
  it('should return true for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration' as const,
    };

    expect(isPieChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration' as const,
    };

    expect(isPieChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration' as const,
    };

    expect(isPieChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for AggregateChartConfiguration', () => {
    const configuration = {
      __typename: 'AggregateChartConfiguration' as const,
    };

    expect(isPieChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for GaugeChartConfiguration', () => {
    const configuration = {
      __typename: 'GaugeChartConfiguration' as const,
    };

    expect(isPieChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isPieChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isPieChartConfiguration(undefined)).toBe(false);
  });
});
