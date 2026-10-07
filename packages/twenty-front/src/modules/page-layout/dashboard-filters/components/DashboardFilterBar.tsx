import { DashboardFilterBarContent } from '@/page-layout/dashboard-filters/components/DashboardFilterBarContent';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const DashboardFilterBar = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  if (currentPageLayout.type !== PageLayoutType.DASHBOARD) {
    return null;
  }

  return <DashboardFilterBarContent />;
};
