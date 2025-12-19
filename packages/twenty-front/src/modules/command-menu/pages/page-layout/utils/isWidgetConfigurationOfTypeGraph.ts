import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { type WidgetConfiguration } from '~/generated/graphql';

export const isWidgetConfigurationOfTypeGraph = (
  configuration: WidgetConfiguration | FieldsConfiguration | null | undefined,
): configuration is ChartConfiguration => {
  return (
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'PieChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'GaugeChartConfiguration')
  );
};
