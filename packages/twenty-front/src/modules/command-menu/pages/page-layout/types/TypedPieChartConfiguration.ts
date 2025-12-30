import {
  type PieChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated/graphql';

export type TypedPieChartConfiguration = PieChartConfiguration & {
  configurationType: WidgetConfigurationType.PIE_CHART;
};
