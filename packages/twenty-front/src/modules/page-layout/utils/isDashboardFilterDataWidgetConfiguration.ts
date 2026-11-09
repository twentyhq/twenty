import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';

export const isDashboardFilterDataWidgetConfiguration = (
  configuration: PageLayoutWidget['configuration'],
): boolean =>
  isWidgetConfigurationOfTypeGraph(configuration) ||
  isWidgetConfigurationOfType(configuration, 'RecordTableConfiguration');
