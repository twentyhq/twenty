import { type BarChartConfiguration } from '~/generated-metadata/graphql';
import { type LineChartConfiguration } from '~/generated-metadata/graphql';

export type GroupByChartConfiguration =
  | BarChartConfiguration
  | LineChartConfiguration;
