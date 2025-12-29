import { WidgetConfigurationType } from '~/generated/graphql';

export const GRAPH_CONFIGURATION_TYPE_TO_CONFIG_TYPENAME: Partial<
  Record<WidgetConfigurationType, string>
> = {
  [WidgetConfigurationType.BAR_CHART]: 'BarChartConfiguration',
  [WidgetConfigurationType.LINE_CHART]: 'LineChartConfiguration',
  [WidgetConfigurationType.PIE_CHART]: 'PieChartConfiguration',
  [WidgetConfigurationType.AGGREGATE_CHART]: 'AggregateChartConfiguration',
  [WidgetConfigurationType.GAUGE_CHART]: 'GaugeChartConfiguration',
} as const;
