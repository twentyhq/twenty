import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useCallback } from 'react';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

// A value the viewer sets or clears through the chip is theirs, so it no longer counts as a cross-filter.
export const useClearDashboardFilterCrossFilterMarker = () => {
  const setDashboardFilterCrossFilterValues = useSetAtomComponentState(
    dashboardFilterCrossFilterValuesComponentState,
  );

  // Effects list this as a dependency, so a new identity per render would re-run them on every slot change.
  const clearDashboardFilterCrossFilterMarker = useCallback(
    (slotId: string) => {
      setDashboardFilterCrossFilterValues(
        (previousDashboardFilterCrossFilterValues) =>
          isDefined(previousDashboardFilterCrossFilterValues[slotId])
            ? removePropertiesFromRecord(
                previousDashboardFilterCrossFilterValues,
                [slotId],
              )
            : previousDashboardFilterCrossFilterValues,
      );
    },
    [setDashboardFilterCrossFilterValues],
  );

  return { clearDashboardFilterCrossFilterMarker };
};
