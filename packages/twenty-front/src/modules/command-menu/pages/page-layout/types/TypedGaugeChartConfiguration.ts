import {
  type GaugeChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated/graphql';

export type TypedGaugeChartConfiguration = GaugeChartConfiguration & {
  configurationType: WidgetConfigurationType.GAUGE_CHART;
};
