import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { findMissingRequiredDashboardFilterSlot } from '@/page-layout/dashboard-filters/utils/findMissingRequiredDashboardFilterSlot';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type DashboardFilterSlot } from 'twenty-shared/types';

export const useMissingRequiredDashboardFilterSlot = (
  widget: PageLayoutWidget,
): DashboardFilterSlot | null => {
  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  return findMissingRequiredDashboardFilterSlot({
    widget,
    slots,
    values: dashboardFilterValues,
    bindings: bindingsByWidgetId[widget.id],
  });
};
