import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { hasInitializedDashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/hasInitializedDashboardFilterValuesComponentState';
import { seededDashboardFilterSlotIdsComponentState } from '@/page-layout/dashboard-filters/states/seededDashboardFilterSlotIdsComponentState';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { resolveDashboardFilterValuesForNewSlots } from '@/page-layout/dashboard-filters/utils/resolveDashboardFilterValuesForNewSlots';
import { resolveInitialDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/resolveInitialDashboardFilterValues';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useLayoutEffect } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';

// Shared by the per-surface initializers: seeds before the first paint, then only fills slots that appear later.
export const useInitializeDashboardFilterValues = ({
  slots,
  valuesFromUrl,
}: {
  slots: DashboardFilterSlot[];
  valuesFromUrl: DashboardFilterValues;
}): boolean => {
  const setDashboardFilterValues = useSetAtomComponentState(
    dashboardFilterValuesComponentState,
  );

  const [
    hasInitializedDashboardFilterValues,
    setHasInitializedDashboardFilterValues,
  ] = useAtomComponentState(hasInitializedDashboardFilterValuesComponentState);

  const [seededDashboardFilterSlotIds, setSeededDashboardFilterSlotIds] =
    useAtomComponentState(seededDashboardFilterSlotIdsComponentState);

  // Layout effect: the values are in place before charts and the reset button paint, so no query fires with empty values.
  useLayoutEffect(() => {
    if (!hasInitializedDashboardFilterValues) {
      setDashboardFilterValues(
        resolveInitialDashboardFilterValues({ slots, valuesFromUrl }),
      );

      setSeededDashboardFilterSlotIds(slots.map((slot) => slot.id));

      setHasInitializedDashboardFilterValues(true);

      return;
    }

    const seededSlotIds = new Set(seededDashboardFilterSlotIds);

    const newSlotIds = slots
      .map((slot) => slot.id)
      .filter((slotId) => !seededSlotIds.has(slotId));

    if (newSlotIds.length === 0) {
      return;
    }

    setDashboardFilterValues((previousValues) =>
      resolveDashboardFilterValuesForNewSlots({
        slots,
        seenSlotIds: seededSlotIds,
        values: previousValues,
      }),
    );

    setSeededDashboardFilterSlotIds([
      ...seededDashboardFilterSlotIds,
      ...newSlotIds,
    ]);
  }, [
    hasInitializedDashboardFilterValues,
    seededDashboardFilterSlotIds,
    slots,
    valuesFromUrl,
    setDashboardFilterValues,
    setHasInitializedDashboardFilterValues,
    setSeededDashboardFilterSlotIds,
  ]);

  // Each open starts from scratch: the next dashboard, or the same one reopened, waits for its own seeding.
  useEffect(
    () => () => setHasInitializedDashboardFilterValues(false),
    [setHasInitializedDashboardFilterValues],
  );

  return hasInitializedDashboardFilterValues;
};
