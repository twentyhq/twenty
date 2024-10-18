import { useEffect } from 'react';

import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { isCurrentViewKeyIndexComponentState } from '@/views/states/isCurrentViewIndexComponentState';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToDeleteViewFilterIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentFamilyState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { View } from '@/views/types/View';
import { getCombinedViewFilterGroups } from '@/views/utils/getCombinedViewFilterGroups';
import { getCombinedViewFilters } from '@/views/utils/getCombinedViewFilters';
import { getCombinedViewSorts } from '@/views/utils/getCombinedViewSorts';
import { getObjectMetadataItemViews } from '@/views/utils/getObjectMetadataItemViews';
import { isDefined } from '~/utils/isDefined';

export const useGetCurrentView = (viewBarInstanceId?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ViewComponentInstanceContext,
    viewBarInstanceId,
  );

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const currentViewId = useRecoilComponentValueV2(
    currentViewIdComponentState,
    instanceId,
  );

  const viewObjectMetadataId = useRecoilComponentValueV2(
    viewObjectMetadataIdComponentState,
    instanceId,
  );

  const setIsCurrentViewKeyIndex = useSetRecoilComponentStateV2(
    isCurrentViewKeyIndexComponentState,
    instanceId,
  );

  const currentViewFromCurrentViewId = views.find(
    (view) => view.id === currentViewId,
  );
  const indexView = views.find(
    (view) =>
      view.key === 'INDEX' && view.objectMetadataId === viewObjectMetadataId,
  );

  const currentView = currentViewId ? currentViewFromCurrentViewId : indexView;

  const viewId = currentViewId ?? indexView?.id;

  useEffect(() => {
    setIsCurrentViewKeyIndex(currentView?.key === 'INDEX');
  }, [currentView, setIsCurrentViewKeyIndex]);

  const viewsOnCurrentObject = getObjectMetadataItemViews(
    viewObjectMetadataId ?? '',
    views,
  );

  const unsavedToUpsertViewFilters = useRecoilComponentFamilyValueV2(
    unsavedToUpsertViewFiltersComponentFamilyState,
    { viewId },
    instanceId,
  );

  const unsavedToUpsertViewFilterGroups = useRecoilComponentFamilyValueV2(
    unsavedToUpsertViewFilterGroupsComponentFamilyState,
    { viewId },
    instanceId,
  );

  const unsavedToUpsertViewSorts = useRecoilComponentFamilyValueV2(
    unsavedToUpsertViewSortsComponentFamilyState,
    { viewId },
    instanceId,
  );

  const unsavedToDeleteViewFilterIds = useRecoilComponentFamilyValueV2(
    unsavedToDeleteViewFilterIdsComponentFamilyState,
    { viewId },
    instanceId,
  );

  const unsavedToDeleteViewFilterGroupIds = useRecoilComponentFamilyValueV2(
    unsavedToDeleteViewFilterGroupIdsComponentFamilyState,
    { viewId },
    instanceId,
  );

  const unsavedToDeleteViewSortIds = useRecoilComponentFamilyValueV2(
    unsavedToDeleteViewSortIdsComponentFamilyState,
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
    viewFilters: getCombinedViewFilters(
      currentView.viewFilters,
      unsavedToUpsertViewFilters,
      unsavedToDeleteViewFilterIds,
    ),
    viewFilterGroups: getCombinedViewFilterGroups(
      currentView.viewFilterGroups ?? [],
      unsavedToUpsertViewFilterGroups,
      unsavedToDeleteViewFilterGroupIds,
    ),
    viewSorts: getCombinedViewSorts(
      currentView.viewSorts,
      unsavedToUpsertViewSorts,
      unsavedToDeleteViewSortIds,
    ),
  };

  return {
    instanceId,
    currentViewWithSavedFiltersAndSorts: currentView,
    currentViewWithCombinedFiltersAndSorts,
    viewsOnCurrentObject: viewsOnCurrentObject ?? [],
    currentViewId,
  };
};
