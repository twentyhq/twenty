import { isAggregateChartConfiguration } from '../isAggregateChartConfiguration';

describe('isAggregateChartConfiguration', () => {
  it('should return true for AggregateChartConfiguration', () => {
    const configuration = {
      __typename: 'AggregateChartConfiguration' as const,
    };

    expect(isAggregateChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration' as const,
    };

    expect(isAggregateChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration' as const,
    };

    expect(isAggregateChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration' as const,
    };

    expect(isAggregateChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for GaugeChartConfiguration', () => {
    const configuration = {
      __typename: 'GaugeChartConfiguration' as const,
    };

    expect(isAggregateChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isAggregateChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isAggregateChartConfiguration(undefined)).toBe(false);
  });
});
