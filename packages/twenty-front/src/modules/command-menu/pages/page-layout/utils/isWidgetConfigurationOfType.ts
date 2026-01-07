import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import {
  type AggregateChartConfiguration,
  type BarChartConfiguration,
  type GaugeChartConfiguration,
  type IframeConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type StandaloneRichTextConfiguration,
  type WidgetConfiguration,
  type WidgetConfigurationType,
} from '~/generated/graphql';

type WidgetConfigurationTypenameMap = {
  AggregateChartConfiguration: Omit<
    AggregateChartConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.AGGREGATE_CHART;
  };
  BarChartConfiguration: Omit<BarChartConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.BAR_CHART;
  };
  GaugeChartConfiguration: Omit<
    GaugeChartConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.GAUGE_CHART;
  };
  IframeConfiguration: Omit<IframeConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.IFRAME;
  };
  LineChartConfiguration: Omit<LineChartConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.LINE_CHART;
  };
  PieChartConfiguration: Omit<PieChartConfiguration, 'configurationType'> & {
    configurationType: WidgetConfigurationType.PIE_CHART;
  };
  StandaloneRichTextConfiguration: Omit<
    StandaloneRichTextConfiguration,
    'configurationType'
  > & {
    configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT;
  };
};

type WidgetConfigurationTypename = keyof WidgetConfigurationTypenameMap;

export type WidgetConfigurationOfType<T extends WidgetConfigurationTypename> =
  WidgetConfigurationTypenameMap[T];

export const isWidgetConfigurationOfType = <
  T extends WidgetConfigurationTypename,
>(
  configuration:
    | WidgetConfiguration
    | FieldsConfiguration
    | FieldConfiguration
    | null
    | undefined,
  typename: T,
): configuration is WidgetConfigurationTypenameMap[T] => {
  return configuration?.__typename === typename;
};
