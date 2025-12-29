import { GraphType } from '@/command-menu/pages/page-layout/types/GraphType';
import { getConfigurationTypeFromGraphType } from '@/command-menu/pages/page-layout/utils/getConfigurationTypeFromGraphType';
import { WidgetConfigurationType } from '~/generated/graphql';

describe('getConfigurationTypeFromGraphType', () => {
  it('returns BAR_CHART for VERTICAL_BAR', () => {
    expect(getConfigurationTypeFromGraphType(GraphType.VERTICAL_BAR)).toBe(
      WidgetConfigurationType.BAR_CHART,
    );
  });

  it('returns BAR_CHART for HORIZONTAL_BAR', () => {
    expect(getConfigurationTypeFromGraphType(GraphType.HORIZONTAL_BAR)).toBe(
      WidgetConfigurationType.BAR_CHART,
    );
  });

  it('returns LINE_CHART for LINE', () => {
    expect(getConfigurationTypeFromGraphType(GraphType.LINE)).toBe(
      WidgetConfigurationType.LINE_CHART,
    );
  });

  it('returns PIE_CHART for PIE', () => {
    expect(getConfigurationTypeFromGraphType(GraphType.PIE)).toBe(
      WidgetConfigurationType.PIE_CHART,
    );
  });

  it('returns AGGREGATE_CHART for AGGREGATE', () => {
    expect(getConfigurationTypeFromGraphType(GraphType.AGGREGATE)).toBe(
      WidgetConfigurationType.AGGREGATE_CHART,
    );
  });

  it('returns GAUGE_CHART for GAUGE', () => {
    expect(getConfigurationTypeFromGraphType(GraphType.GAUGE)).toBe(
      WidgetConfigurationType.GAUGE_CHART,
    );
  });

  it('throws for unknown graph type', () => {
    const unknownGraphType = 'UNKNOWN' as never;
    expect(() => getConfigurationTypeFromGraphType(unknownGraphType)).toThrow();
  });
});
