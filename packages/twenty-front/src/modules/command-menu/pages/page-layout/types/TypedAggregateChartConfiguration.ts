import {
  type AggregateChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated/graphql';

export type TypedAggregateChartConfiguration = AggregateChartConfiguration & {
  configurationType: WidgetConfigurationType.AGGREGATE_CHART;
};
