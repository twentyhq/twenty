import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated-metadata/graphql';

export type GroupByChartConfiguration =
  | BarChartConfiguration
  | LineChartConfiguration;
