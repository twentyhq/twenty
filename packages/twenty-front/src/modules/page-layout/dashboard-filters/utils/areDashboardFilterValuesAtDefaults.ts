import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { getDashboardFilterDefaultValues } from '@/page-layout/dashboard-filters/utils/getDashboardFilterDefaultValues';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Only the dashboard's slots are compared: a value left behind by a removed slot is already ignored by the charts and the URL.
export const areDashboardFilterValuesAtDefaults = ({
  slots,
  values,
}: {
  slots: DashboardFilterSlot[];
  values: DashboardFilterValues;
}): boolean => {
  const defaultValues = getDashboardFilterDefaultValues({ slots });

  return slots.every((slot) => {
    const value = values[slot.id];
    const defaultValue = defaultValues[slot.id];

    if (!isDefined(value) || !isDefined(defaultValue)) {
      return !isDefined(value) && !isDefined(defaultValue);
    }

    return (
      value.operand === defaultValue.operand &&
      value.value === defaultValue.value
    );
  });
};
