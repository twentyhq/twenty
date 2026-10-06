import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { type DashboardFilterBinding } from 'twenty-shared/types';

// Each built-in rule yields one binding per widget; charts read them the other way round, keyed by widget then slot.
export const groupDashboardFilterBindingsByWidgetId = (
  bindingByWidgetIdBySlotId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >,
): DashboardFilterBindingsByWidgetId => {
  const bindingsByWidgetId: DashboardFilterBindingsByWidgetId = {};

  for (const [slotId, bindingByWidgetId] of Object.entries(
    bindingByWidgetIdBySlotId,
  )) {
    for (const [widgetId, binding] of Object.entries(bindingByWidgetId)) {
      bindingsByWidgetId[widgetId] = {
        ...bindingsByWidgetId[widgetId],
        [slotId]: binding,
      };
    }
  }

  return bindingsByWidgetId;
};
