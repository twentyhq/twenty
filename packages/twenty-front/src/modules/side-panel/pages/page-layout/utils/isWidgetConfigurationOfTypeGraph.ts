import { type ChartConfiguration } from '@/side-panel/pages/page-layout/types/ChartConfiguration';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import {
  type FieldsConfiguration,
  type WidgetConfiguration,
} from '~/generated-metadata/graphql';

export const isWidgetConfigurationOfTypeGraph = (
  configuration:
    | WidgetConfiguration
    | FieldsConfiguration
    | FieldConfiguration
    | null
    | undefined,
): configuration is ChartConfiguration => {
  return (
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'GaugeChartConfiguration')
  );
};
