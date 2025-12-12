import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type GaugeChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type WaffleChartConfiguration,
} from '~/generated/graphql';

export type ChartWidgetConfiguration =
  | BarChartConfiguration
  | GaugeChartConfiguration
  | LineChartConfiguration
  | AggregateChartConfiguration
  | PieChartConfiguration
  | WaffleChartConfiguration;