import { type ChartWidget } from '@/command-menu/pages/page-layout/types/ChartWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type WidgetConfiguration } from '~/generated/graphql';

export const isChartWidget = (
  pageLayoutWidget: PageLayoutWidget,
): pageLayoutWidget is ChartWidget => {
  return isWidgetConfigurationOfTypeGraph(
    // TODO: Remove this cast when we FieldsConfiguration and FieldConfiguration are in the backend
    pageLayoutWidget.configuration as WidgetConfiguration,
  );
};
