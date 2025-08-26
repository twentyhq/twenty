import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useRefreshCoreViews } from '@/views/hooks/useRefreshCoreViews';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const useSaveRecordSortsToViewSorts = () => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const {
    createViewSortRecords,
    updateViewSortRecords,
    deleteViewSortRecords,
  } = usePersistViewSortRecords();

  const { refreshCoreViews } = useRefreshCoreViews();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordSortsCallbackState = useRecoilComponentCallbackState(
    currentRecordSortsComponentState,
  );

  const saveRecordSortsToViewSorts = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!isDefined(currentView)) {
          return;
        }

        const currentViewSorts = currentView?.viewSorts ?? [];

        const currentRecordSorts = getSnapshotValue(
          snapshot,
          currentRecordSortsCallbackState,
        );

        const newViewSorts = currentRecordSorts.map(mapRecordSortToViewSort);

        const viewSortsToCreate = getViewSortsToCreate(
          currentViewSorts,
          newViewSorts,
        );

        const viewSortsToDelete = getViewSortsToDelete(
          currentViewSorts,
          newViewSorts,
        );

        const viewSortsToUpdate = getViewSortsToUpdate(
          currentViewSorts,
          newViewSorts,
        );

        const viewSortIdsToDelete = viewSortsToDelete.map(
          (viewSort) => viewSort.id,
        );

        await createViewSortRecords(viewSortsToCreate, currentView);
        await updateViewSortRecords(viewSortsToUpdate);
        await deleteViewSortRecords(viewSortIdsToDelete);

        if (isCoreViewEnabled) {
          await refreshCoreViews(objectMetadataItem.id);
        }
      },
    [
      currentView,
      currentRecordSortsCallbackState,
      createViewSortRecords,
      updateViewSortRecords,
      deleteViewSortRecords,
      refreshCoreViews,
      objectMetadataItem.id,
    ],
  );

  return {
    saveRecordSortsToViewSorts,
  };
};
