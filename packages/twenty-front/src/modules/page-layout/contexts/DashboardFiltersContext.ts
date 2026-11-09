import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { createContext } from 'react';

export const DashboardFiltersContext = createContext<DashboardFilters | null>(
  null,
);
