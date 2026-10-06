import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterSlotFilterType,
} from 'twenty-shared/types';

// A filterable concept shared by the dashboard's charts, before it becomes a slot: the user picks one from the "Add filter" menu.
export type DashboardFilterCandidateDimension = {
  id: string;
  label: string;
  filterType: DashboardFilterSlotFilterType;
  proposedBindingsByWidgetId: Record<string, DashboardFilterBinding | null>;
  boundChartCount: number;
  chartCount: number;
  isBuiltIn?: boolean;
};

export type DashboardFilterCandidateDimensionBuiltInInput = {
  slots: Pick<DashboardFilterSlot, 'id' | 'label' | 'filterType'>[];
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
};
