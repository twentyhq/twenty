import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistViewFilterRecords } from '@/views/hooks/internal/usePersistViewFilterRecords';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useRefreshCoreViews } from '@/views/hooks/useRefreshCoreViews';
import { getViewFiltersToCreate } from '@/views/utils/getViewFiltersToCreate';
import { getViewFiltersToDelete } from '@/views/utils/getViewFiltersToDelete';
import { getViewFiltersToUpdate } from '@/views/utils/getViewFiltersToUpdate';
import { mapRecordFilterToViewFilter } from '@/views/utils/mapRecordFilterToViewFilter';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const useSaveRecordFiltersToViewFilters = () => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const {
    createViewFilterRecords,
    updateViewFilterRecords,
    deleteViewFilterRecords,
  } = usePersistViewFilterRecords();

  const { refreshCoreViews } = useRefreshCoreViews();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFiltersCallbackState = useRecoilComponentCallbackState(
    currentRecordFiltersComponentState,
  );

  const saveRecordFiltersToViewFilters = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!isDefined(currentView)) {
          return;
        }

        const currentViewFilters = currentView?.viewFilters ?? [];

        const currentRecordFilters = getSnapshotValue(
          snapshot,
          currentRecordFiltersCallbackState,
        );

        const newViewFilters = currentRecordFilters.map(
          mapRecordFilterToViewFilter,
        );

        const viewFiltersToCreate = getViewFiltersToCreate(
          currentViewFilters,
          newViewFilters,
        );

        const viewFiltersToDelete = getViewFiltersToDelete(
          currentViewFilters,
          newViewFilters,
        );

        const viewFiltersToUpdate = getViewFiltersToUpdate(
          currentViewFilters,
          newViewFilters,
        );

        const viewFilterIdsToDelete = viewFiltersToDelete.map(
          (viewFilter) => viewFilter.id,
        );

        await createViewFilterRecords(viewFiltersToCreate, currentView);
        await updateViewFilterRecords(viewFiltersToUpdate);
        await deleteViewFilterRecords(viewFilterIdsToDelete);

        if (isCoreViewEnabled) {
          await refreshCoreViews(objectMetadataItem.id);
        }
      },
    [
      currentView,
      currentRecordFiltersCallbackState,
      createViewFilterRecords,
      updateViewFilterRecords,
      deleteViewFilterRecords,
      isCoreViewEnabled,
      refreshCoreViews,
      objectMetadataItem.id,
    ],
  );

  return {
    saveRecordFiltersToViewFilters,
  };
};
