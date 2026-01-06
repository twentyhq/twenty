import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { GraphType } from '@/command-menu/pages/page-layout/types/GraphType';
import { getCurrentGraphTypeFromConfig } from '@/command-menu/pages/page-layout/utils/getCurrentGraphTypeFromConfig';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION_HORIZONTAL,
  TEST_GAUGE_CHART_CONFIGURATION,
  TEST_LINE_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('getCurrentGraphTypeFromConfig', () => {
  it('returns VERTICAL_BAR for bar chart with vertical layout', () => {
    expect(
      getCurrentGraphTypeFromConfig(
        TEST_BAR_CHART_CONFIGURATION as ChartConfiguration,
      ),
    ).toBe(GraphType.VERTICAL_BAR);
  });

  it('returns HORIZONTAL_BAR for bar chart with horizontal layout', () => {
    expect(
      getCurrentGraphTypeFromConfig(
        TEST_BAR_CHART_CONFIGURATION_HORIZONTAL as ChartConfiguration,
      ),
    ).toBe(GraphType.HORIZONTAL_BAR);
  });

  it('returns LINE for line chart', () => {
    expect(
      getCurrentGraphTypeFromConfig(
        TEST_LINE_CHART_CONFIGURATION as ChartConfiguration,
      ),
    ).toBe(GraphType.LINE);
  });

  it('returns PIE for pie chart', () => {
    expect(
      getCurrentGraphTypeFromConfig(
        TEST_PIE_CHART_CONFIGURATION as ChartConfiguration,
      ),
    ).toBe(GraphType.PIE);
  });

  it('returns AGGREGATE for aggregate chart', () => {
    expect(
      getCurrentGraphTypeFromConfig(
        TEST_AGGREGATE_CHART_CONFIGURATION as ChartConfiguration,
      ),
    ).toBe(GraphType.AGGREGATE);
  });

  it('returns GAUGE for gauge chart', () => {
    expect(
      getCurrentGraphTypeFromConfig(
        TEST_GAUGE_CHART_CONFIGURATION as ChartConfiguration,
      ),
    ).toBe(GraphType.GAUGE);
  });

  it('throws for unknown configuration type', () => {
    const unknownConfig = {
      __typename: 'UnknownConfiguration',
    } as unknown as ChartConfiguration;

    expect(() => getCurrentGraphTypeFromConfig(unknownConfig)).toThrow(
      'Unknown chart configuration type',
    );
  });
});
