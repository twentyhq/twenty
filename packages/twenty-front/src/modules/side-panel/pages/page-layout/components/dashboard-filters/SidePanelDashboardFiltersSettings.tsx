import { DashboardFiltersSettingsContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFiltersSettingsContent';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SidePanelDashboardFiltersSettings = () => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  // The editor writes into the draft, which only exists while the dashboard is being edited.
  const isDashboardInEditMode = useAtomComponentStateValue(
    isDashboardInEditModeComponentState,
    pageLayoutId ?? undefined,
  );

  if (
    !isDashboardFiltersEnabled ||
    !isDefined(pageLayoutId) ||
    !isDashboardInEditMode
  ) {
    return null;
  }

  return <DashboardFiltersSettingsContent pageLayoutId={pageLayoutId} />;
};
