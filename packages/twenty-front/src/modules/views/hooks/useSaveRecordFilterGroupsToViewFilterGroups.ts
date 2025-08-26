import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroupRecords';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useRefreshCoreViews } from '@/views/hooks/useRefreshCoreViews';
import { getViewFilterGroupsToCreate } from '@/views/utils/getViewFilterGroupsToCreate';
import { getViewFilterGroupsToDelete } from '@/views/utils/getViewFilterGroupsToDelete';
import { getViewFilterGroupsToUpdate } from '@/views/utils/getViewFilterGroupsToUpdate';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const useSaveRecordFilterGroupsToViewFilterGroups = () => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const {
    createViewFilterGroupRecords,
    updateViewFilterGroupRecords,
    deleteViewFilterGroupRecords,
  } = usePersistViewFilterGroupRecords();

  const { refreshCoreViews } = useRefreshCoreViews();

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackState(currentRecordFilterGroupsComponentState);

  const saveRecordFilterGroupsToViewFilterGroups = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!isDefined(currentView)) {
          return;
        }

        const currentViewFilterGroups = currentView?.viewFilterGroups ?? [];

        const currentRecordFilterGroups = getSnapshotValue(
          snapshot,
          currentRecordFilterGroupsCallbackState,
        );

        const newViewFilterGroups = currentRecordFilterGroups.map(
          (recordFilterGroup) =>
            mapRecordFilterGroupToViewFilterGroup({
              recordFilterGroup,
              view: currentView,
            }),
        );

        const viewFilterGroupsToCreate = getViewFilterGroupsToCreate(
          currentViewFilterGroups,
          newViewFilterGroups,
        );

        const viewFilterGroupsToDelete = getViewFilterGroupsToDelete(
          currentViewFilterGroups,
          newViewFilterGroups,
        );

        const viewFilterGroupsToUpdate = getViewFilterGroupsToUpdate(
          currentViewFilterGroups,
          newViewFilterGroups,
        );

        const viewFilterGroupIdsToDelete = viewFilterGroupsToDelete.map(
          (viewFilterGroup) => viewFilterGroup.id,
        );

        await createViewFilterGroupRecords(
          viewFilterGroupsToCreate,
          currentView,
        );
        await updateViewFilterGroupRecords(viewFilterGroupsToUpdate);
        await deleteViewFilterGroupRecords(viewFilterGroupIdsToDelete);

        if (isCoreViewEnabled) {
          await refreshCoreViews(objectMetadataItem.id);
        }
      },
    [
      currentView,
      currentRecordFilterGroupsCallbackState,
      createViewFilterGroupRecords,
      updateViewFilterGroupRecords,
      deleteViewFilterGroupRecords,
      isCoreViewEnabled,
      refreshCoreViews,
      objectMetadataItem.id,
    ],
  );

  return {
    saveRecordFilterGroupsToViewFilterGroups,
  };
};
