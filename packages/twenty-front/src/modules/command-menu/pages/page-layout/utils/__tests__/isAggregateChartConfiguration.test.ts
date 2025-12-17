import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
} from '~/generated/graphql';
import { isAggregateChartConfiguration } from '../isAggregateChartConfiguration';

describe('isAggregateChartConfiguration', () => {
  it('should return true for AggregateChartConfiguration', () => {
    const configuration = {
      __typename: 'AggregateChartConfiguration',
    } as AggregateChartConfiguration;

    expect(isAggregateChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration',
    } as BarChartConfiguration;

    expect(isAggregateChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isAggregateChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isAggregateChartConfiguration(undefined)).toBe(false);
  });
});
