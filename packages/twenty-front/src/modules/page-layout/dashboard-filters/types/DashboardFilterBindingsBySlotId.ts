import { type DashboardFilterBinding } from 'twenty-shared/types';

export type DashboardFilterBindingsBySlotId = Record<
  string,
  DashboardFilterBinding | null
>;
