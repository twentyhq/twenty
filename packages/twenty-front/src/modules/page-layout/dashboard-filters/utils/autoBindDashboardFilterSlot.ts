import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

export const autoBindDashboardFilterSlot = ({
  dimension,
  slotId = v4(),
}: {
  dimension: DashboardFilterCandidateDimension;
  slotId?: string;
}): {
  slot: DashboardFilterSlot;
  bindingsByWidgetId: Record<string, DashboardFilterBinding>;
} => ({
  slot: {
    id: slotId,
    label: dimension.label,
    filterType: dimension.filterType,
    defaultOperand:
      getRecordFilterOperands({ filterType: dimension.filterType })[0] ?? null,
    isRequired: false,
  },
  bindingsByWidgetId: dimension.proposedBindingsByWidgetId,
});
