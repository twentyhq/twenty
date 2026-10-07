import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { BUILT_IN_DASHBOARD_FILTER_SLOTS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlots';
import { computeBuiltInBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInBindings';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
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

  const slots = useMemo(
    () =>
      hasDashboardFilters
        ? BUILT_IN_DASHBOARD_FILTER_SLOTS.map((builtInSlot) => ({
            ...builtInSlot,
            label: t(builtInSlot.label),
          }))
        : [],
    [hasDashboardFilters, t],
  );

  const bindingsByWidgetId = useMemo(
    () =>
      hasDashboardFilters
        ? computeBuiltInBindings({
            widgets: currentPageLayout.tabs.flatMap((tab) => tab.widgets),
            objectMetadataItems,
          })
        : {},
    [hasDashboardFilters, currentPageLayout, objectMetadataItems],
  );

  return { slots, bindingsByWidgetId };
};
