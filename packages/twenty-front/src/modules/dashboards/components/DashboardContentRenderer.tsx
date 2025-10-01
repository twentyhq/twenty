import { type Dashboard } from '@/dashboards/components/types/Dashboard';
import { useSetIsDashboardInEditMode } from '@/dashboards/hooks/useSetDashboardInEditMode';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { isPageLayoutEmpty } from '@/page-layout/utils/isPageLayoutEmpty';

type DashboardContentRendererProps = {
  dashboard: Dashboard;
};

export const DashboardContentRenderer = ({
  dashboard,
}: DashboardContentRendererProps) => {
  const pageLayoutId = dashboard.pageLayoutId;

  const { setIsDashboardInEditMode } =
    useSetIsDashboardInEditMode(pageLayoutId);

  const onInitialized = (pageLayout: PageLayout) => {
    if (isPageLayoutEmpty(pageLayout)) {
      setIsDashboardInEditMode(true);
    } else {
      setIsDashboardInEditMode(false);
    }
  };

  return (
    <PageLayoutRenderer
      pageLayoutId={pageLayoutId}
      onInitialized={onInitialized}
    />
  );
};
