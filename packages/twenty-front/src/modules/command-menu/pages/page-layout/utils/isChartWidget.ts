import { type ChartWidget } from '@/command-menu/pages/page-layout/types/ChartWidget';
import { WidgetType } from '~/generated/graphql';

export const isChartWidget = (
  pageLayoutWidget: any,
): pageLayoutWidget is ChartWidget => {
  return pageLayoutWidget.type === WidgetType.GRAPH;
};
