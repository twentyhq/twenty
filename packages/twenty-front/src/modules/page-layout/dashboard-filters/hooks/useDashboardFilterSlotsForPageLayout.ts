import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useBuiltInDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useBuiltInDashboardFilterSlots';
import {
  type ResolvedDashboardFilterSlots,
  resolveDashboardFilterSlots,
} from '@/page-layout/dashboard-filters/utils/resolveDashboardFilterSlots';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

// Side-panel pages render outside the page layout instance context, so the draft is read by id.
export const useDashboardFilterSlotsForPageLayout = (
  pageLayoutId: string,
): ResolvedDashboardFilterSlots => {
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const builtInSlots = useBuiltInDashboardFilterSlots();

  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  return useMemo(
    () =>
      resolveDashboardFilterSlots({
        pageLayout: pageLayoutDraft,
        objectMetadataItems,
        isDashboardFiltersEnabled,
        builtInSlots,
      }),
    [
      pageLayoutDraft,
      objectMetadataItems,
      isDashboardFiltersEnabled,
      builtInSlots,
    ],
  );
};
