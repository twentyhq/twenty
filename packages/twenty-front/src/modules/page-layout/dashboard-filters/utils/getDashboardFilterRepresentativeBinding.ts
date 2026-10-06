import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The chip reuses the regular filter inputs, which need a field: the first bound field stands in for the slot.
export const getDashboardFilterRepresentativeBinding = ({
  slotId,
  bindingsByWidgetId,
}: {
  slotId: string;
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
}): DashboardFilterBinding | undefined => {
  return Object.values(bindingsByWidgetId)
    .map((bindingsBySlotId) => bindingsBySlotId[slotId])
    .find(isDefined);
};
