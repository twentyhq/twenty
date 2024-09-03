import { useEffect } from 'react';

import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useAvailableInstanceIdOrThrow } from '@/ui/utilities/state/instance/hooks/useAvailableInstanceIdOrThrow';
import { useRecoilInstanceValue } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceValue';
import { useSetRecoilInstanceState } from '@/ui/utilities/state/instance/hooks/useSetRecoilInstanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';
import { currentViewIdInstanceState } from '@/views/states/currentViewIdInstanceState';
import { isCurrentViewKeyIndexInstanceState } from '@/views/states/isCurrentViewIndexInstanceState';
import { unsavedToDeleteViewFilterIdsInstanceState } from '@/views/states/unsavedToDeleteViewFilterIdsInstanceState';
import { unsavedToDeleteViewSortIdsInstanceState } from '@/views/states/unsavedToDeleteViewSortIdsInstanceState';
import { unsavedToUpsertViewFiltersInstanceState } from '@/views/states/unsavedToUpsertViewFiltersInstanceState';
import { unsavedToUpsertViewSortsInstanceState } from '@/views/states/unsavedToUpsertViewSortsInstanceState';
import { viewObjectMetadataIdInstanceState } from '@/views/states/viewObjectMetadataIdInstanceState';
import { View } from '@/views/types/View';
import { combinedViewFilters } from '@/views/utils/combinedViewFilters';
import { combinedViewSorts } from '@/views/utils/combinedViewSorts';
import { getObjectMetadataItemViews } from '@/views/utils/getObjectMetadataItemViews';
import { isDefined } from '~/utils/isDefined';

export const useGetCurrentView = (viewBarInstanceId?: string) => {
  const instanceId = useAvailableInstanceIdOrThrow(
    ViewInstanceContext,
    viewBarInstanceId,
  );

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const currentViewId = useRecoilInstanceValue(
    currentViewIdInstanceState,
    instanceId,
  );

  const viewObjectMetadataId = useRecoilInstanceValue(
    viewObjectMetadataIdInstanceState,
    instanceId,
  );

  const setIsCurrentViewKeyIndex = useSetRecoilInstanceState(
    isCurrentViewKeyIndexInstanceState,
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

  const unsavedToUpsertViewFilters = useRecoilInstanceValue(
    unsavedToUpsertViewFiltersInstanceState,
    instanceId,
  );

  const unsavedToUpsertViewSorts = useRecoilInstanceValue(
    unsavedToUpsertViewSortsInstanceState,
    instanceId,
  );

  const unsavedToDeleteViewFilterIds = useRecoilInstanceValue(
    unsavedToDeleteViewFilterIdsInstanceState,
    instanceId,
  );

  const unsavedToDeleteViewSortIds = useRecoilInstanceValue(
    unsavedToDeleteViewSortIdsInstanceState,
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
