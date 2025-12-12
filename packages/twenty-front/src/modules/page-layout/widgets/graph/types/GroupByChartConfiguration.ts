import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type WaffleChartConfiguration,
} from '~/generated-metadata/graphql';

export type GroupByChartConfiguration =
  | BarChartConfiguration
  | LineChartConfiguration
  | PieChartConfiguration
  | WaffleChartConfiguration;
