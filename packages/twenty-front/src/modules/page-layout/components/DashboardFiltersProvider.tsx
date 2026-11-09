import { DashboardFiltersFromUrlProvider } from '@/page-layout/components/DashboardFiltersFromUrlProvider';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { type ReactNode } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

type DashboardFiltersProviderProps = {
  children: ReactNode;
};

export const DashboardFiltersProvider = ({
  children,
}: DashboardFiltersProviderProps) => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  if (
    !isDashboardFiltersEnabled ||
    currentPageLayout.type !== PageLayoutType.DASHBOARD
  ) {
    return children;
  }

  return (
    <DashboardFiltersFromUrlProvider
      pageLayoutFilters={currentPageLayout.filters}
    >
      {children}
    </DashboardFiltersFromUrlProvider>
  );
};
