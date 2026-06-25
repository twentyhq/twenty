import {
  type AggregateChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export type TypedAggregateChartConfiguration = AggregateChartConfiguration & {
  configurationType: WidgetConfigurationType.AGGREGATE_CHART;
};
