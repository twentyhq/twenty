import { type DashboardFilterBindingsBySlotId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsBySlotId';

export type DashboardFilterBindingsByWidgetId = Record<
  string,
  DashboardFilterBindingsBySlotId
>;
