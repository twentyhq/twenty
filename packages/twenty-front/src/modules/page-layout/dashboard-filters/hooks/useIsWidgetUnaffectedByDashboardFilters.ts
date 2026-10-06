import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { isWidgetUnaffectedByDashboardFilters } from '@/page-layout/dashboard-filters/utils/isWidgetUnaffectedByDashboardFilters';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useIsWidgetUnaffectedByDashboardFilters = (
  widgetId: string,
): boolean => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  return (
    isDashboardFiltersEnabled &&
    isWidgetUnaffectedByDashboardFilters({
      widgetId,
      slots,
      values: dashboardFilterValues,
      bindingsByWidgetId,
    })
  );
};
