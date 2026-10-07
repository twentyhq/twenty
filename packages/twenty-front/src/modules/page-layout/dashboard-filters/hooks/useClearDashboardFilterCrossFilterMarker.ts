import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

// A value the viewer sets or clears through the chip is theirs, so it no longer counts as a cross-filter.
export const useClearDashboardFilterCrossFilterMarker = () => {
  const setDashboardFilterCrossFilterValues = useSetAtomComponentState(
    dashboardFilterCrossFilterValuesComponentState,
  );

  const clearDashboardFilterCrossFilterMarker = (slotId: string) => {
    setDashboardFilterCrossFilterValues(
      (previousDashboardFilterCrossFilterValues) =>
        isDefined(previousDashboardFilterCrossFilterValues[slotId])
          ? removePropertiesFromRecord(
              previousDashboardFilterCrossFilterValues,
              [slotId],
            )
          : previousDashboardFilterCrossFilterValues,
    );
  };

  return { clearDashboardFilterCrossFilterMarker };
};
