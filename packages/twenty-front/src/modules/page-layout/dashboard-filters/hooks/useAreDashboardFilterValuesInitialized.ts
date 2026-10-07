import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { hasInitializedDashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/hasInitializedDashboardFilterValuesComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

// Only a dashboard with slots mounts an initializer, so anything else counts as initialized and is never held back.
export const useAreDashboardFilterValuesInitialized = (): boolean => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { slots } = useDashboardFilterSlots();

  const hasInitializedDashboardFilterValues = useAtomComponentStateValue(
    hasInitializedDashboardFilterValuesComponentState,
  );

  return (
    !isDashboardFiltersEnabled ||
    slots.length === 0 ||
    hasInitializedDashboardFilterValues
  );
};
