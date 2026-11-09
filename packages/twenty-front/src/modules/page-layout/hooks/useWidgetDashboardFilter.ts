import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { WidgetDashboardFilterContext } from '@/page-layout/contexts/WidgetDashboardFilterContext';
import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { useContext } from 'react';

export const useWidgetDashboardFilter = (): WidgetDashboardFilter =>
  useContext(WidgetDashboardFilterContext) ?? NO_WIDGET_DASHBOARD_FILTER;
