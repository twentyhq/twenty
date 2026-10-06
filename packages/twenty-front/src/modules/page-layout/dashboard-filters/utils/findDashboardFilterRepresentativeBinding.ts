import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The filter inputs need a field: the first bound field stands in for the slot. Callers that know the metadata can skip bindings whose field is gone.
export const findDashboardFilterRepresentativeBinding = ({
  slotId,
  bindingsByWidgetId,
  isBindingUsable = () => true,
}: {
  slotId: string;
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
  isBindingUsable?: (binding: DashboardFilterBinding) => boolean;
}): DashboardFilterBinding | undefined =>
  Object.values(bindingsByWidgetId)
    .map((bindingsBySlotId) => bindingsBySlotId[slotId])
    .filter(isDefined)
    .find(isBindingUsable);
