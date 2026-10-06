import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { type DashboardFilterSlotDefinition } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinition';

export type DashboardFilterSlotDefinitionsAndBindings = {
  slotDefinitions: DashboardFilterSlotDefinition[];
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
};
