import { getDashboardFilterSlotDefaultValue } from '@/page-layout/dashboard-filters/utils/getDashboardFilterSlotDefaultValue';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The URL wins so a reload or shared link restores the same values; defaults only fill the slots it leaves out.
export const resolveInitialDashboardFilterValues = ({
  slots,
  urlValues,
}: {
  slots: DashboardFilterSlot[];
  urlValues: Record<string, DashboardFilterValue | undefined>;
}): Record<string, DashboardFilterValue> =>
  Object.fromEntries(
    slots.flatMap((slot) => {
      const value =
        urlValues[slot.id] ?? getDashboardFilterSlotDefaultValue(slot);

      return isDefined(value) ? [[slot.id, value]] : [];
    }),
  );
