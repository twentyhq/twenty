import { DashboardFiltersSettingsContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFiltersSettingsContent';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SidePanelDashboardFiltersSettings = () => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  if (!isDashboardFiltersEnabled || !isDefined(pageLayoutId)) {
    return null;
  }

  return <DashboardFiltersSettingsContent pageLayoutId={pageLayoutId} />;
};
