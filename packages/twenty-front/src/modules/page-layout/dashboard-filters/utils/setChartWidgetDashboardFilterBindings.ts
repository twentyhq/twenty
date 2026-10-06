import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { type DashboardFilterBindingsBySlotId } from 'twenty-shared/types';

export const setChartWidgetDashboardFilterBindings = (
  widget: ChartWidget,
  dashboardFilterBindings: DashboardFilterBindingsBySlotId | undefined,
): ChartWidget => ({
  ...widget,
  configuration: {
    ...widget.configuration,
    dashboardFilterBindings,
  },
});
