import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useClearDashboardFilterCrossFilterMarker } from '@/page-layout/dashboard-filters/hooks/useClearDashboardFilterCrossFilterMarker';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
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

  const store = useStore();

  const dashboardFilterValuesState = useAtomComponentStateCallbackState(
    dashboardFilterValuesComponentState,
  );

  const { clearDashboardFilterCrossFilterMarker } =
    useClearDashboardFilterCrossFilterMarker();

  useEffect(() => {
    const [currentRecordFilter] = currentRecordFilters;

    // The scratch stays empty until the chip is opened, so an empty list says nothing about the slot value.
    if (!isDefined(currentRecordFilter)) {
      return;
    }

    const previousDashboardFilterValues = store.get(dashboardFilterValuesState);
    const previousValue = previousDashboardFilterValues[slotId];

    if (!isRecordFilterValueValid(currentRecordFilter)) {
      if (!isDefined(previousValue)) {
        return;
      }

      store.set(
        dashboardFilterValuesState,
        removePropertiesFromRecord(previousDashboardFilterValues, [slotId]),
      );
      clearDashboardFilterCrossFilterMarker(slotId);
      return;
    }

    // Opening the chip re-seeds the scratch with the slot value, which must not count as the viewer editing it.
    if (
      previousValue?.operand === currentRecordFilter.operand &&
      previousValue?.value === currentRecordFilter.value
    ) {
      return;
    }

    store.set(dashboardFilterValuesState, {
      ...previousDashboardFilterValues,
      [slotId]: {
        operand: currentRecordFilter.operand,
        value: currentRecordFilter.value,
      },
    });
    clearDashboardFilterCrossFilterMarker(slotId);
  }, [
    currentRecordFilters,
    store,
    dashboardFilterValuesState,
    clearDashboardFilterCrossFilterMarker,
    slotId,
  ]);

  return null;
};
