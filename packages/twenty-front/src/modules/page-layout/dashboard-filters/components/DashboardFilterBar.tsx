import { DashboardFilterBarContent } from '@/page-layout/dashboard-filters/components/DashboardFilterBarContent';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, PageLayoutType } from '~/generated-metadata/graphql';

export const DashboardFilterBar = () => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  if (
    !isDashboardFiltersEnabled ||
    currentPageLayout.type !== PageLayoutType.DASHBOARD
  ) {
    return null;
  }

  return <DashboardFilterBarContent />;
};
