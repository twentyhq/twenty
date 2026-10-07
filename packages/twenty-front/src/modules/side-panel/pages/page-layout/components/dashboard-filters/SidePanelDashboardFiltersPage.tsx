import { SidePanelDashboardFiltersPageContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/SidePanelDashboardFiltersPageContent';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelDashboardFiltersPage = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  if (!isDefined(pageLayoutId)) {
    return null;
  }

  return <SidePanelDashboardFiltersPageContent pageLayoutId={pageLayoutId} />;
};
