import { dashboardFilterCrossFilterTabIdComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterTabIdComponentState';
import { dashboardFilterCrossFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterValuesComponentState';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type DashboardFilterValue } from 'twenty-shared/types';

export const useApplyDashboardCrossFilter = () => {
  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  const setDashboardFilterValues = useSetAtomComponentState(
    dashboardFilterValuesComponentState,
  );

  const setDashboardFilterCrossFilterValues = useSetAtomComponentState(
    dashboardFilterCrossFilterValuesComponentState,
  );

  const setDashboardFilterCrossFilterTabId = useSetAtomComponentState(
    dashboardFilterCrossFilterTabIdComponentState,
  );

  // The slot value goes through the same state as a manual pick, so the URL and the merge treat it alike.
  const applyDashboardCrossFilter = ({
    slotId,
    value,
  }: {
    slotId: string;
    value: DashboardFilterValue;
  }) => {
    setDashboardFilterValues((previousDashboardFilterValues) => ({
      ...previousDashboardFilterValues,
      [slotId]: value,
    }));
    setDashboardFilterCrossFilterValues(
      (previousDashboardFilterCrossFilterValues) => ({
        ...previousDashboardFilterCrossFilterValues,
        [slotId]: value,
      }),
    );
    setDashboardFilterCrossFilterTabId(activeTabId);
  };

  return { applyDashboardCrossFilter };
};
