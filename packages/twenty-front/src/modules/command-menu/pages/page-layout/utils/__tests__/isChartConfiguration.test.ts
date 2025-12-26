import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type GaugeChartConfiguration,
  type IframeConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type StandaloneRichTextConfiguration,
} from '~/generated/graphql';
import { isChartConfiguration } from '@/command-menu/pages/page-layout/utils/isChartConfiguration';

describe('isChartConfiguration', () => {
  it('should return true for BarChartConfiguration', () => {
    const configuration = {
      __typename: 'BarChartConfiguration',
    } as BarChartConfiguration;

    expect(isChartConfiguration(configuration)).toBe(true);
  });

  it('should return true for LineChartConfiguration', () => {
    const configuration = {
      __typename: 'LineChartConfiguration',
    } as LineChartConfiguration;

    expect(isChartConfiguration(configuration)).toBe(true);
  });

  it('should return true for PieChartConfiguration', () => {
    const configuration = {
      __typename: 'PieChartConfiguration',
    } as PieChartConfiguration;

    expect(isChartConfiguration(configuration)).toBe(true);
  });

  it('should return true for AggregateChartConfiguration', () => {
    const configuration = {
      __typename: 'AggregateChartConfiguration',
    } as AggregateChartConfiguration;

    expect(isChartConfiguration(configuration)).toBe(true);
  });

  it('should return true for GaugeChartConfiguration', () => {
    const configuration = {
      __typename: 'GaugeChartConfiguration',
    } as GaugeChartConfiguration;

    expect(isChartConfiguration(configuration)).toBe(true);
  });

  it('should return false for IframeConfiguration', () => {
    const configuration = {
      __typename: 'IframeConfiguration',
    } as IframeConfiguration;

    expect(isChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for StandaloneRichTextConfiguration', () => {
    const configuration = {
      __typename: 'StandaloneRichTextConfiguration',
    } as StandaloneRichTextConfiguration;

    expect(isChartConfiguration(configuration)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isChartConfiguration(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isChartConfiguration(undefined)).toBe(false);
  });
});
