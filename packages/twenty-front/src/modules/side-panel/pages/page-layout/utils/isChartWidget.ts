import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export const isChartWidget = (
  pageLayoutWidget: PageLayoutWidget,
): pageLayoutWidget is ChartWidget => {
  return isWidgetConfigurationOfTypeGraph(pageLayoutWidget.configuration);
};
