import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useBuiltInDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useBuiltInDashboardFilterSlots';
import {
  type ResolvedDashboardFilterSlots,
  resolveDashboardFilterSlots,
} from '@/page-layout/dashboard-filters/utils/resolveDashboardFilterSlots';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

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

  return useMemo(
    () =>
      resolveDashboardFilterSlots({
        pageLayout: pageLayoutDraft,
        objectMetadataItems,
        builtInSlots,
      }),
    [pageLayoutDraft, objectMetadataItems, builtInSlots],
  );
};
