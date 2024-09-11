import { useEffect } from 'react';

import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { isCurrentViewKeyIndexComponentState } from '@/views/states/isCurrentViewIndexComponentState';
import { unsavedToDeleteViewFilterIdsComponentState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentState';
import { unsavedToDeleteViewSortIdsComponentState } from '@/views/states/unsavedToDeleteViewSortIdsComponentState';
import { unsavedToUpsertViewFiltersComponentState } from '@/views/states/unsavedToUpsertViewFiltersComponentState';
import { unsavedToUpsertViewSortsComponentState } from '@/views/states/unsavedToUpsertViewSortsComponentState';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { View } from '@/views/types/View';
import { combinedViewFilters } from '@/views/utils/combinedViewFilters';
import { combinedViewSorts } from '@/views/utils/combinedViewSorts';
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

  useEffect(() => {
    setIsCurrentViewKeyIndex(currentView?.key === 'INDEX');
  }, [currentView, setIsCurrentViewKeyIndex]);

  const viewsOnCurrentObject = getObjectMetadataItemViews(
    viewObjectMetadataId ?? '',
    views,
  );

  const unsavedToUpsertViewFilters = useRecoilComponentValueV2(
    unsavedToUpsertViewFiltersComponentState,
    instanceId,
  );

  const unsavedToUpsertViewSorts = useRecoilComponentValueV2(
    unsavedToUpsertViewSortsComponentState,
    instanceId,
  );

  const unsavedToDeleteViewFilterIds = useRecoilComponentValueV2(
    unsavedToDeleteViewFilterIdsComponentState,
    instanceId,
  );

  const unsavedToDeleteViewSortIds = useRecoilComponentValueV2(
    unsavedToDeleteViewSortIdsComponentState,
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
    viewFilters: combinedViewFilters(
      currentView.viewFilters,
      unsavedToUpsertViewFilters,
      unsavedToDeleteViewFilterIds,
    ),
    viewSorts: combinedViewSorts(
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
  };
};
