import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';
import { isBarChartConfiguration } from '@/modules/command-menu/pages/page-layout/utils/isBarChartConfiguration';

describe('isBarChartConfiguration', () => {
  it('should return true for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration' as const,
    } as BarChartConfiguration;

    expect(isBarChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration' as const,
    } as LineChartConfiguration;

    expect(isBarChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBarChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBarChartConfiguration(undefined)).toBe(false);
  });
});
