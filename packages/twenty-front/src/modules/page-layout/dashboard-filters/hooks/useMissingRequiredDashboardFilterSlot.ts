import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { findMissingRequiredDashboardFilterSlotForWidget } from '@/page-layout/dashboard-filters/utils/findMissingRequiredDashboardFilterSlotForWidget';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

// Read before any chart query hook runs: a chart bound to a required slot without value has nothing meaningful to show.
export const useMissingRequiredDashboardFilterSlot = ():
  | DashboardFilterSlot
  | undefined => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const currentWidget = useCurrentWidgetOrNull();

  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  if (!isDashboardFiltersEnabled || !isDefined(currentWidget)) {
    return undefined;
  }

  return findMissingRequiredDashboardFilterSlotForWidget({
    widgetId: currentWidget.id,
    slots,
    values: dashboardFilterValues,
    bindingsByWidgetId,
  });
};
