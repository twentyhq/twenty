import {
  type BarChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated/graphql';

export type TypedBarChartConfiguration = BarChartConfiguration & {
  configurationType: WidgetConfigurationType.BAR_CHART;
};
