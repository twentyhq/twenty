import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { createContext } from 'react';

export const WidgetDashboardFilterContext =
  createContext<WidgetDashboardFilter | null>(null);
