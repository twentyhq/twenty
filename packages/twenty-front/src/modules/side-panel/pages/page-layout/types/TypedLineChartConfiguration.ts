import {
  type LineChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export type TypedLineChartConfiguration = LineChartConfiguration & {
  configurationType: WidgetConfigurationType.LINE_CHART;
};
