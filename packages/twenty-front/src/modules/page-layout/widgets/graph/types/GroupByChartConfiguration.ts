import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

export type GroupByChartConfiguration =
  | BarChartConfiguration
  | LineChartConfiguration
  | PieChartConfiguration;
