import { type Dashboard } from '@/dashboards/components/types/Dashboard';
import { useSetDashboardEditMode } from '@/dashboards/hooks/useSetDashboardInEditMode';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { type PageLayoutWithData } from '@/page-layout/types/pageLayoutTypes';
import { isPageLayoutEmpty } from '@/page-layout/utils/isPageLayoutEmpty';

type DashboardContentRendererProps = {
  dashboard: Dashboard;
};

export const DashboardContentRenderer = ({
  dashboard,
}: DashboardContentRendererProps) => {
  const pageLayoutId = dashboard.pageLayoutId;

  const { setDashboardEditMode } = useSetDashboardEditMode(pageLayoutId);

  const onInitialized = (pageLayout: PageLayoutWithData) => {
    isPageLayoutEmpty(pageLayout)
      ? setDashboardEditMode(true)
      : setDashboardEditMode(false);
  };

  return (
    <PageLayoutRenderer
      pageLayoutId={pageLayoutId}
      onInitialized={onInitialized}
    />
  );
};
