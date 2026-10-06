import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterSlotFilterType,
} from 'twenty-shared/types';

// Bindings are proposed per chart up front so adding a filter is one click, with no field to pick afterwards.
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
