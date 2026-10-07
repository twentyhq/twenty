import { getDashboardFilterSlotDefaultValue } from '@/page-layout/dashboard-filters/utils/getDashboardFilterSlotDefaultValue';
import { isDashboardFilterValueSet } from '@/page-layout/dashboard-filters/utils/isDashboardFilterValueSet';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';

const areDashboardFilterValuesEqual = (
  firstValue: DashboardFilterValue | undefined,
  secondValue: DashboardFilterValue | undefined,
): boolean =>
  firstValue?.operand === secondValue?.operand &&
  firstValue?.value === secondValue?.value;

export const areDashboardFilterValuesAtDefaults = ({
  slots,
  values,
}: {
  slots: DashboardFilterSlot[];
  values: Record<string, DashboardFilterValue | undefined>;
}): boolean =>
  slots.every((slot) => {
    const value = values[slot.id];

    return areDashboardFilterValuesEqual(
      isDashboardFilterValueSet(value) ? value : undefined,
      getDashboardFilterSlotDefaultValue(slot),
    );
  });
