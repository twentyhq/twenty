import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';
import { isLineChartConfiguration } from '@/modules/command-menu/pages/page-layout/utils/isLineChartConfiguration';

describe('isLineChartConfiguration', () => {
  it('should return true for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration',
    } as LineChartConfiguration;

    expect(isLineChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration',
    } as BarChartConfiguration;

    expect(isLineChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isLineChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isLineChartConfiguration(undefined)).toBe(false);
  });
});
