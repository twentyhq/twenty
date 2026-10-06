import { type DashboardFilterValue } from 'twenty-shared/types';

export type DashboardFilterValues = Record<
  string,
  DashboardFilterValue | undefined
>;
