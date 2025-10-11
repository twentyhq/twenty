import {
  type BarChartConfiguration,
  type GaugeChartConfiguration,
  type LineChartConfiguration,
  type NumberChartConfiguration,
  type PieChartConfiguration,
} from '~/generated/graphql';

export type ChartConfiguration =
  | BarChartConfiguration
  | LineChartConfiguration
  | PieChartConfiguration
  | NumberChartConfiguration
  | GaugeChartConfiguration;
