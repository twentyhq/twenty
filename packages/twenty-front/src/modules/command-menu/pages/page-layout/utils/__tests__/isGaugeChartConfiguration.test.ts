import {
  type BarChartConfiguration,
  type GaugeChartConfiguration,
} from '~/generated/graphql';
import { isGaugeChartConfiguration } from '@/modules/command-menu/pages/page-layout/utils/isGaugeChartConfiguration';

describe('isGaugeChartConfiguration', () => {
  it('should return true for GaugeChartConfiguration', () => {
    const configuration = {
      __typename: 'GaugeChartConfiguration',
    } as GaugeChartConfiguration;

    expect(isGaugeChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration',
    } as BarChartConfiguration;

    expect(isGaugeChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isGaugeChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isGaugeChartConfiguration(undefined)).toBe(false);
  });
});
