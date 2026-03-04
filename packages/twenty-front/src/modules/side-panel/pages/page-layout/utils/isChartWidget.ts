import { type ChartWidget } from '@/command-menu/pages/page-layout/types/ChartWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export const isChartWidget = (
  pageLayoutWidget: PageLayoutWidget,
): pageLayoutWidget is ChartWidget => {
  return isWidgetConfigurationOfTypeGraph(pageLayoutWidget.configuration);
};
