import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useDashboardFilterSlotsForPageLayout } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlotsForPageLayout';
import { type DashboardFilterCandidateDimension } from '@/page-layout/dashboard-filters/types/DashboardFilterCandidateDimension';
import { computeDashboardFilterCandidateDimensions } from '@/page-layout/dashboard-filters/utils/computeDashboardFilterCandidateDimensions';
import { prioritizeBuiltInDashboardFilterCandidateDimensions } from '@/page-layout/dashboard-filters/utils/prioritizeBuiltInDashboardFilterCandidateDimensions';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useDashboardFilterCandidateDimensions = (
  pageLayoutId: string,
): DashboardFilterCandidateDimension[] => {
  const { t } = useLingui();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const isJsonFilterEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_JSON_FILTER_ENABLED,
  );

  const { bindingsByWidgetId, isUsingBuiltInSlots } =
    useDashboardFilterSlotsForPageLayout(pageLayoutId);

  return useMemo(() => {
    const dimensions = computeDashboardFilterCandidateDimensions({
      widgets: pageLayoutDraft.tabs.flatMap((tab) => tab.widgets),
      objectMetadataItems,
      // Built-in bindings are not slots the user owns, so they must stay pickable.
      existingBindingsByWidgetId: isUsingBuiltInSlots
        ? undefined
        : bindingsByWidgetId,
      isJsonFilterEnabled,
    });

    if (!isUsingBuiltInSlots) {
      return dimensions;
    }

    return prioritizeBuiltInDashboardFilterCandidateDimensions({
      dimensions,
      workspaceMemberObjectMetadataId: objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular ===
          CoreObjectNameSingular.WorkspaceMember,
      )?.id,
      dateLabel: t`Date`,
      ownerLabel: t`Owner`,
    });
  }, [
    pageLayoutDraft,
    objectMetadataItems,
    bindingsByWidgetId,
    isUsingBuiltInSlots,
    isJsonFilterEnabled,
    t,
  ]);
};
