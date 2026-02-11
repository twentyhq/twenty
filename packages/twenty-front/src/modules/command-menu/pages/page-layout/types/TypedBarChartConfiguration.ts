import {
  type BarChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export type TypedBarChartConfiguration = BarChartConfiguration & {
  configurationType: WidgetConfigurationType.BAR_CHART;
};
