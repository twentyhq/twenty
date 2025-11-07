import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistViewFilterGroupRecords } from '@/views/hooks/internal/usePersistViewFilterGroup';
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
    createViewFilterGroups,
    updateViewFilterGroups,
    deleteViewFilterGroups,
  } = usePersistViewFilterGroupRecords();

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

        await createViewFilterGroups(viewFilterGroupsToCreate, currentView);
        await updateViewFilterGroups(viewFilterGroupsToUpdate);
        await deleteViewFilterGroups(viewFilterGroupIdsToDelete);
      },
    [
      canPersistChanges,
      currentView,
      currentRecordFilterGroupsCallbackState,
      createViewFilterGroups,
      updateViewFilterGroups,
      deleteViewFilterGroups,
    ],
  );

  return {
    saveRecordFilterGroupsToViewFilterGroups,
  };
};
