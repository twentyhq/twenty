import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import {
  isDashboardFilterValueValidForSlot,
  isDefined,
} from 'twenty-shared/utils';

// A default is persisted on the layout and can outlive the field options it was written against, so it gets the same check as a URL value.
export const getDashboardFilterDefaultValues = ({
  slots,
}: {
  slots: DashboardFilterSlot[];
}): DashboardFilterValues =>
  Object.fromEntries(
    slots.flatMap((slot) => {
      const defaultValue = slot.defaultValue;

      return isDefined(defaultValue) &&
        isDashboardFilterValueValidForSlot({ slot, value: defaultValue })
        ? [[slot.id, defaultValue]]
        : [];
    }),
  );
