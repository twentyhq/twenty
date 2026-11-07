import { DashboardFiltersContext } from '@/page-layout/contexts/DashboardFiltersContext';
import { useContext } from 'react';

export const useDashboardFilters = () => useContext(DashboardFiltersContext);
