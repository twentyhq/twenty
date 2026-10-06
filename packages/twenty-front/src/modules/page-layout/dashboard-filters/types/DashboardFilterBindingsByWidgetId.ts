import { type DashboardFilterBindingsBySlotId } from 'twenty-shared/types';

export type DashboardFilterBindingsByWidgetId = Record<
  string,
  DashboardFilterBindingsBySlotId
>;
