import {
  type LineChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated/graphql';

export type TypedLineChartConfiguration = LineChartConfiguration & {
  configurationType: WidgetConfigurationType.LINE_CHART;
};
