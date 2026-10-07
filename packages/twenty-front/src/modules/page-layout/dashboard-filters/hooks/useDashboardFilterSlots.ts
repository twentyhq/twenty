import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { BUILT_IN_DASHBOARD_FILTER_SLOTS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlots';
import { computeBuiltInBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInBindings';
import { computePersistedDashboardFilterBindings } from '@/page-layout/dashboard-filters/utils/computePersistedDashboardFilterBindings';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey, PageLayoutType } from '~/generated-metadata/graphql';

type UseDashboardFilterSlotsResult = {
  slots: DashboardFilterSlot[];
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
};

export const useDashboardFilterSlots = (): UseDashboardFilterSlotsResult => {
  const { t } = useLingui();
  const { currentPageLayout } = useCurrentPageLayout();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const hasDashboardFilters =
    isDashboardFiltersEnabled &&
    currentPageLayout?.type === PageLayoutType.DASHBOARD;

  // null means the dashboard was never configured, so the built-ins apply
  const persistedSlots = hasDashboardFilters
    ? ((currentPageLayout.dashboardFilters as DashboardFilterSlot[] | null) ??
      null)
    : null;

  const slots = useMemo(() => {
    if (!hasDashboardFilters) {
      return [];
    }

    if (isDefined(persistedSlots)) {
      return persistedSlots;
    }

    return BUILT_IN_DASHBOARD_FILTER_SLOTS.map((builtInSlot) => ({
      ...builtInSlot,
      label: t(builtInSlot.label),
    }));
  }, [hasDashboardFilters, persistedSlots, t]);

  const bindingsByWidgetId = useMemo(() => {
    if (!hasDashboardFilters) {
      return {};
    }

    const widgets = currentPageLayout.tabs.flatMap((tab) => tab.widgets);

    if (isDefined(persistedSlots)) {
      return computePersistedDashboardFilterBindings({ widgets });
    }

    return computeBuiltInBindings({ widgets, objectMetadataItems });
  }, [
    hasDashboardFilters,
    persistedSlots,
    currentPageLayout,
    objectMetadataItems,
  ]);

  return { slots, bindingsByWidgetId };
};
