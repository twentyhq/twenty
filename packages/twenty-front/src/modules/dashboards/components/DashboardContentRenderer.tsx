import { type Dashboard } from '@/dashboards/components/types/Dashboard';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { isPageLayoutEmpty } from '@/page-layout/utils/isPageLayoutEmpty';

type DashboardContentRendererProps = {
  dashboard: Dashboard;
};

export const DashboardContentRenderer = ({
  dashboard,
}: DashboardContentRendererProps) => {
  const pageLayoutId = dashboard.pageLayoutId;

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const onInitialized = (pageLayout: PageLayout) => {
    if (isPageLayoutEmpty(pageLayout)) {
      setIsPageLayoutInEditMode(true);
    } else {
      setIsPageLayoutInEditMode(false);
    }
  };

  return (
    <PageLayoutRenderer
      pageLayoutId={pageLayoutId}
      onInitialized={onInitialized}
    />
  );
};
