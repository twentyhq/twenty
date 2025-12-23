import {
  type BarChartConfiguration,
  type IframeConfiguration,
} from '~/generated/graphql';
import { isIframeConfiguration } from '@/modules/command-menu/pages/page-layout/utils/isIframeConfiguration';

describe('isIframeConfiguration', () => {
  it('should return true for IframeConfiguration', () => {
    const configuration = {
      __typename: 'IframeConfiguration',
    } as IframeConfiguration;

    expect(isIframeConfiguration(configuration)).toBe(true);
  });

  it('should return false for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration',
    } as BarChartConfiguration;

    expect(isIframeConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isIframeConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isIframeConfiguration(undefined)).toBe(false);
  });
});
