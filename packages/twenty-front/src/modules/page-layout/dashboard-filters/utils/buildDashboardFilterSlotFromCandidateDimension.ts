import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const buildDashboardFilterSlotFromCandidateDimension = (
  dimension: DashboardFilterCandidateDimension,
): {
  slot: DashboardFilterSlot;
  bindingsByWidgetId: Record<string, DashboardFilterBinding | null>;
} => ({
  slot: {
    id: v4(),
    label: dimension.label,
    filterType: dimension.filterType,
  },
  bindingsByWidgetId: { ...dimension.proposedBindingsByWidgetId },
});
