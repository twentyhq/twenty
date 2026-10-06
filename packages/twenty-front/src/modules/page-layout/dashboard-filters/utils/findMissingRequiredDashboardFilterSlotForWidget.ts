import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import {
  isDashboardFilterValueValidForSlot,
  isDefined,
} from 'twenty-shared/utils';

// An invalid value is dropped by the filter engine, so for a required slot it counts as missing rather than silently querying unfiltered.
export const findMissingRequiredDashboardFilterSlotForWidget = ({
  widgetId,
  slots,
  values,
  bindingsByWidgetId,
}: {
  widgetId: string;
  slots: DashboardFilterSlot[];
  values: DashboardFilterValues;
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
}): DashboardFilterSlot | undefined => {
  const widgetBindings = bindingsByWidgetId[widgetId];

  if (!isDefined(widgetBindings)) {
    return undefined;
  }

  return slots.find((slot) => {
    if (slot.isRequired !== true || !isDefined(widgetBindings[slot.id])) {
      return false;
    }

    const value = values[slot.id];

    return (
      !isDefined(value) || !isDashboardFilterValueValidForSlot({ slot, value })
    );
  });
};
