import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type GaugeChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type WaffleChartConfiguration,
} from '~/generated/graphql';

export type ChartConfiguration =
  | BarChartConfiguration
  | LineChartConfiguration
  | PieChartConfiguration
  | AggregateChartConfiguration
  | GaugeChartConfiguration
  | WaffleChartConfiguration;
