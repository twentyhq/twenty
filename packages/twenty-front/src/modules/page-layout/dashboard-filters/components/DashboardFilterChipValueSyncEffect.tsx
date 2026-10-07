import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';
import {
  isDefined,
  isRecordFilterValueValid,
  removePropertiesFromRecord,
} from 'twenty-shared/utils';

type DashboardFilterChipValueSyncEffectProps = {
  slotId: string;
};

// Mirrors the chip's scratch RecordFilter, written by the reused filter inputs, into the slot value.
export const DashboardFilterChipValueSyncEffect = ({
  slotId,
}: DashboardFilterChipValueSyncEffectProps) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const setDashboardFilterValues = useSetAtomComponentState(
    dashboardFilterValuesComponentState,
  );

  useEffect(() => {
    const [currentRecordFilter] = currentRecordFilters;

    // The scratch stays empty until the chip is opened, so an empty list says nothing about the slot value.
    if (!isDefined(currentRecordFilter)) {
      return;
    }

    setDashboardFilterValues((previousDashboardFilterValues) => {
      const previousValue = previousDashboardFilterValues[slotId];

      if (!isRecordFilterValueValid(currentRecordFilter)) {
        return isDefined(previousValue)
          ? removePropertiesFromRecord(previousDashboardFilterValues, [slotId])
          : previousDashboardFilterValues;
      }

      if (
        previousValue?.operand === currentRecordFilter.operand &&
        previousValue?.value === currentRecordFilter.value
      ) {
        return previousDashboardFilterValues;
      }

      return {
        ...previousDashboardFilterValues,
        [slotId]: {
          operand: currentRecordFilter.operand,
          value: currentRecordFilter.value,
        },
      };
    });
  }, [currentRecordFilters, setDashboardFilterValues, slotId]);

  return null;
};
