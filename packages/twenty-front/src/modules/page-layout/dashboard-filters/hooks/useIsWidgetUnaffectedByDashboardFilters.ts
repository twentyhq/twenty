import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { isWidgetUnaffectedByDashboardFilters } from '@/page-layout/dashboard-filters/utils/isWidgetUnaffectedByDashboardFilters';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useIsWidgetUnaffectedByDashboardFilters = (
  widgetId: string,
): boolean => {
  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  return isWidgetUnaffectedByDashboardFilters({
    widgetId,
    slots,
    values: dashboardFilterValues,
    bindingsByWidgetId,
  });
};
