import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { isDefined } from 'twenty-shared/utils';

// Only charts take bindings, so every widget known to the bindings is a chart.
export const countDashboardFilterSlotBoundCharts = ({
  slotId,
  bindingsByWidgetId,
}: {
  slotId: string;
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
}): { boundChartCount: number; chartCount: number } => {
  const bindingsOfEachChart = Object.values(bindingsByWidgetId);

  return {
    boundChartCount: bindingsOfEachChart.filter((bindingsBySlotId) =>
      isDefined(bindingsBySlotId[slotId]),
    ).length,
    chartCount: bindingsOfEachChart.length,
  };
};
