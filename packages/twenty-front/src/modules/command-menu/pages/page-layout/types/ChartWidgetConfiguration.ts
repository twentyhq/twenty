import {
  type BarChartConfiguration,
  type GaugeChartConfiguration,
  type LineChartConfiguration,
  type NumberChartConfiguration,
  type PieChartConfiguration,
} from '~/generated/graphql';

export type ChartWidgetConfiguration =
  | BarChartConfiguration
  | GaugeChartConfiguration
  | LineChartConfiguration
  | NumberChartConfiguration
  | PieChartConfiguration;
