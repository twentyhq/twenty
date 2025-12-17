import {
  type BarChartConfiguration,
  type PieChartConfiguration,
} from '~/generated/graphql';
import { isPieChartConfiguration } from '../isPieChartConfiguration';

describe('isPieChartConfiguration', () => {
  it('should return true for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration',
    } as PieChartConfiguration;

    expect(isPieChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration',
    } as BarChartConfiguration;

    expect(isPieChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isPieChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isPieChartConfiguration(undefined)).toBe(false);
  });
});
