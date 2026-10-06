import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import {
  isDashboardFilterValueValidForSlot,
  isDefined,
} from 'twenty-shared/utils';

// Only values the filter engine would actually apply count, so an invalid value never flags every widget.
export const isWidgetUnaffectedByDashboardFilters = ({
  widgetId,
  slots,
  values,
  bindingsByWidgetId,
}: {
  widgetId: string;
  slots: DashboardFilterSlot[];
  values: DashboardFilterValues;
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
}): boolean => {
  const widgetBindings = bindingsByWidgetId[widgetId];

  if (!isDefined(widgetBindings)) {
    return false;
  }

  const activeSlots = slots.filter((slot) => {
    const value = values[slot.id];

    return (
      isDefined(value) && isDashboardFilterValueValidForSlot({ slot, value })
    );
  });

  return (
    activeSlots.length > 0 &&
    activeSlots.every((slot) => !isDefined(widgetBindings[slot.id]))
  );
};
