import {
  type PieChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export type TypedPieChartConfiguration = PieChartConfiguration & {
  configurationType: WidgetConfigurationType.PIE_CHART;
};
