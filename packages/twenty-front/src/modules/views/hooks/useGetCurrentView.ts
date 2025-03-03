import { useEffect } from 'react';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { prefetchIndexViewIdFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchIndexViewIdFromObjectMetadataItemFamilySelector';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { prefetchViewsFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchViewsFromObjectMetadataItemFamilySelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isCurrentViewKeyIndexComponentState } from '@/views/states/isCurrentViewIndexComponentState';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { getCombinedViewFilterGroups } from '@/views/utils/getCombinedViewFilterGroups';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useGetCurrentView = (viewBarInstanceId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ViewComponentInstanceContext,
    viewBarInstanceId,
  );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  const indexViewId = useRecoilValue(
    prefetchIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const currentViewFromViewId = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: currentViewId ?? '',
    }),
  );

  const indexView = useRecoilValue(
    prefetchViewFromViewIdFamilySelector({
      viewId: indexViewId ?? '',
    }),
  );

  const setIsCurrentViewKeyIndex = useSetRecoilComponentStateV2(
    isCurrentViewKeyIndexComponentState,
    instanceId,
  );

  const viewId = currentViewId ?? indexView?.id;
  const currentView = currentViewFromViewId ?? indexView;

  useEffect(() => {
    setIsCurrentViewKeyIndex(currentView?.key === 'INDEX');
  }, [currentView, setIsCurrentViewKeyIndex]);

  const viewsOnCurrentObject = useRecoilValue(
    prefetchViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const unsavedToUpsertViewFilterGroups = useRecoilComponentFamilyValueV2(
    unsavedToUpsertViewFilterGroupsComponentFamilyState,
    { viewId },
    instanceId,
  );

  const unsavedToDeleteViewFilterGroupIds = useRecoilComponentFamilyValueV2(
    unsavedToDeleteViewFilterGroupIdsComponentFamilyState,
    { viewId },
    instanceId,
  );

  if (!isDefined(currentView)) {
    return {
      instanceId,
      currentViewWithSavedFiltersAndSorts: undefined,
      currentViewWithCombinedFiltersAndSorts: undefined,
      viewsOnCurrentObject: viewsOnCurrentObject ?? [],
    };
  }

  const currentViewWithCombinedFiltersAndSorts = {
    ...currentView,
    viewFilterGroups: getCombinedViewFilterGroups(
      currentView.viewFilterGroups ?? [],
      unsavedToUpsertViewFilterGroups,
      unsavedToDeleteViewFilterGroupIds,
    ),
  };

  return {
    instanceId,
    currentViewWithCombinedFiltersAndSorts,
    viewsOnCurrentObject: viewsOnCurrentObject ?? [],
    currentViewId,
  };
};
