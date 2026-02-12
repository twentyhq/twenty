import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePerformViewFilterGroupAPIPersist } from '@/views/hooks/internal/usePerformViewFilterGroupAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewFilterGroupsToCreate } from '@/views/utils/getViewFilterGroupsToCreate';
import { getViewFilterGroupsToDelete } from '@/views/utils/getViewFilterGroupsToDelete';
import { getViewFilterGroupsToUpdate } from '@/views/utils/getViewFilterGroupsToUpdate';
import { mapRecordFilterGroupToViewFilterGroup } from '@/views/utils/mapRecordFilterGroupToViewFilterGroup';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordFilterGroupsToViewFilterGroups = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const {
    performViewFilterGroupAPICreate,
    performViewFilterGroupAPIUpdate,
    performViewFilterGroupAPIDelete,
  } = usePerformViewFilterGroupAPIPersist();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackState(currentRecordFilterGroupsComponentState);

  const saveRecordFilterGroupsToViewFilterGroups = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!canPersistChanges || !isDefined(currentView)) {
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

        await performViewFilterGroupAPICreate(
          viewFilterGroupsToCreate,
          currentView,
        );
        await performViewFilterGroupAPIUpdate(viewFilterGroupsToUpdate);
        await performViewFilterGroupAPIDelete(viewFilterGroupIdsToDelete);
      },
    [
      canPersistChanges,
      currentView,
      currentRecordFilterGroupsCallbackState,
      performViewFilterGroupAPICreate,
      performViewFilterGroupAPIUpdate,
      performViewFilterGroupAPIDelete,
    ],
  );

  return {
    saveRecordFilterGroupsToViewFilterGroups,
  };
};
