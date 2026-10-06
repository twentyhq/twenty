import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { isDefined } from 'twenty-shared/utils';

export const countDashboardFilterSlotBoundWidgets = ({
  slotId,
  bindingsByWidgetId,
}: {
  slotId: string;
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
}): { boundWidgetCount: number; totalWidgetCount: number } => {
  const bindingsOfEachWidget = Object.values(bindingsByWidgetId);

  return {
    boundWidgetCount: bindingsOfEachWidget.filter((bindingsBySlotId) =>
      isDefined(bindingsBySlotId[slotId]),
    ).length,
    totalWidgetCount: bindingsOfEachWidget.length,
  };
};
