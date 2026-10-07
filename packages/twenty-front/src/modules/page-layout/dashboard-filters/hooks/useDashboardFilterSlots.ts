import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useBuiltInDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useBuiltInDashboardFilterSlots';
import { resolveDashboardFilterSlots } from '@/page-layout/dashboard-filters/utils/resolveDashboardFilterSlots';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type UseDashboardFilterSlotsResult = {
  slots: DashboardFilterSlot[];
  bindingsByWidgetId: Record<
    string,
    Record<string, DashboardFilterBinding | null>
  >;
  isUsingBuiltInSlots: boolean;
};

export const useDashboardFilterSlots = (): UseDashboardFilterSlotsResult => {
  const { currentPageLayout } = useCurrentPageLayout();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const builtInSlots = useBuiltInDashboardFilterSlots();

  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { slots, bindingsByWidgetId, isUsingBuiltInSlots } = useMemo(
    () =>
      resolveDashboardFilterSlots({
        pageLayout: currentPageLayout,
        objectMetadataItems,
        isDashboardFiltersEnabled,
        builtInSlots,
      }),
    [
      currentPageLayout,
      objectMetadataItems,
      isDashboardFiltersEnabled,
      builtInSlots,
    ],
  );

  return { slots, bindingsByWidgetId, isUsingBuiltInSlots };
};
