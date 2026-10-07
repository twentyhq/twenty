import { getDashboardFilterSlotDefaultValue } from '@/page-layout/dashboard-filters/utils/getDashboardFilterSlotDefaultValue';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const computeDashboardFilterDefaultValues = (
  slots: DashboardFilterSlot[],
): Record<string, DashboardFilterValue> =>
  Object.fromEntries(
    slots.flatMap((slot) => {
      const defaultValue = getDashboardFilterSlotDefaultValue(slot);

      return isDefined(defaultValue) ? [[slot.id, defaultValue]] : [];
    }),
  );
