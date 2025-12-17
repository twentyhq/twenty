import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated/graphql';
import { isBarOrLineChartConfiguration } from '../isBarOrLineChartConfiguration';

describe('isBarOrLineChartConfiguration', () => {
  it('should return true for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration',
    } as BarChartConfiguration;

    expect(isBarOrLineChartConfiguration(configuration)).toBe(true);
  });

  it('should return true for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration',
    } as LineChartConfiguration;

    expect(isBarOrLineChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration',
    } as PieChartConfiguration;

    expect(isBarOrLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBarOrLineChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBarOrLineChartConfiguration(undefined)).toBe(false);
  });
});
