import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type GaugeChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated/graphql';

export type ChartConfiguration =
  | (BarChartConfiguration & {
      configurationType: WidgetConfigurationType.BAR_CHART;
    })
  | (LineChartConfiguration & {
      configurationType: WidgetConfigurationType.LINE_CHART;
    })
  | (PieChartConfiguration & {
      configurationType: WidgetConfigurationType.PIE_CHART;
    })
  | (AggregateChartConfiguration & {
      configurationType: WidgetConfigurationType.AGGREGATE_CHART;
    })
  | (GaugeChartConfiguration & {
      configurationType: WidgetConfigurationType.GAUGE_CHART;
    });
