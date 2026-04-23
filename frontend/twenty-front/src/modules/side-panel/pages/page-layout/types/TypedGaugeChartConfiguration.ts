import {
  type GaugeChartConfiguration,
  type WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export type TypedGaugeChartConfiguration = GaugeChartConfiguration & {
  configurationType: WidgetConfigurationType.GAUGE_CHART;
};
