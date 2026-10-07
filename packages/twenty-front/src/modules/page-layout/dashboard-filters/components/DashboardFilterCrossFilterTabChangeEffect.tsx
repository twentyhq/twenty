import { useClearDashboardCrossFilters } from '@/page-layout/dashboard-filters/hooks/useClearDashboardCrossFilters';
import { dashboardFilterCrossFilterTabIdComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterCrossFilterTabIdComponentState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

// A cross-filter is a drill into the charts of one tab, so leaving that tab drops it like Looker and Superset do.
// The tab list owns the switch, which is why this listens to the active tab instead of handling an event.
export const DashboardFilterCrossFilterTabChangeEffect = () => {
  const activeTabId = useAtomComponentStateValue(activeTabIdComponentState);

  const dashboardFilterCrossFilterTabId = useAtomComponentStateValue(
    dashboardFilterCrossFilterTabIdComponentState,
  );

  const { clearDashboardCrossFilters } = useClearDashboardCrossFilters();

  useEffect(() => {
    // The active tab passes through null while the tab list reloads; that is not the viewer leaving.
    if (
      !isDefined(activeTabId) ||
      !isDefined(dashboardFilterCrossFilterTabId) ||
      activeTabId === dashboardFilterCrossFilterTabId
    ) {
      return;
    }

    clearDashboardCrossFilters();
  }, [
    activeTabId,
    dashboardFilterCrossFilterTabId,
    clearDashboardCrossFilters,
  ]);

  return null;
};
