import { useCallback } from 'react';

import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { SidePanelPages } from 'twenty-shared/types';

// The page resolves its dashboard from the context store, like the other dashboard settings pages, so no page layout id travels with the navigation.
export const useOpenDashboardFiltersInSidePanel = () => {
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const openDashboardFiltersInSidePanel = useCallback(() => {
    navigatePageLayoutSidePanel({
      sidePanelPage: SidePanelPages.DashboardFiltersSettings,
      resetNavigationStack: true,
    });
  }, [navigatePageLayoutSidePanel]);

  return { openDashboardFiltersInSidePanel };
};
