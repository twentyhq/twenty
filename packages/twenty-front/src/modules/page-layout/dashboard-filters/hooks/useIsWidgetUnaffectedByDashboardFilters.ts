import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { isWidgetUnaffectedByDashboardFilters } from '@/page-layout/dashboard-filters/utils/isWidgetUnaffectedByDashboardFilters';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useIsWidgetUnaffectedByDashboardFilters = (
  widget: PageLayoutWidget,
): boolean => {
  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  return isWidgetUnaffectedByDashboardFilters({
    widget,
    slots,
    values: dashboardFilterValues,
    bindings: bindingsByWidgetId[widget.id],
  });
};
