import { dashboardFilterCrossFilterTabIdComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterTabIdComponentState';
import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { removeCrossFilteredDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/removeCrossFilteredDashboardFilterValues';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useClearDashboardCrossFilters = () => {
  const store = useStore();

  const dashboardFilterValuesState = useAtomComponentStateCallbackState(
    dashboardFilterValuesComponentState,
  );

  const dashboardFilterCrossFilterValuesState =
    useAtomComponentStateCallbackState(
      dashboardFilterCrossFilterValuesComponentState,
    );

  const dashboardFilterCrossFilterTabIdState =
    useAtomComponentStateCallbackState(
      dashboardFilterCrossFilterTabIdComponentState,
    );

  const clearDashboardCrossFilters = useCallback(() => {
    const dashboardFilterCrossFilterValues = store.get(
      dashboardFilterCrossFilterValuesState,
    );

    store.set(
      dashboardFilterValuesState,
      removeCrossFilteredDashboardFilterValues({
        dashboardFilterValues: store.get(dashboardFilterValuesState),
        dashboardFilterCrossFilterValues,
      }),
    );
    store.set(dashboardFilterCrossFilterValuesState, {});
    store.set(dashboardFilterCrossFilterTabIdState, null);
  }, [
    store,
    dashboardFilterValuesState,
    dashboardFilterCrossFilterValuesState,
    dashboardFilterCrossFilterTabIdState,
  ]);

  return { clearDashboardCrossFilters };
};
