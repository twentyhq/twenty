import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSort';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordSortsToViewSorts = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { createViewSorts, updateViewSorts, deleteViewSorts } =
    usePersistViewSortRecords();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordSortsCallbackState = useRecoilComponentCallbackState(
    currentRecordSortsComponentState,
  );

  const saveRecordSortsToViewSorts = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!canPersistChanges || !isDefined(currentView)) {
          return;
        }

        const currentViewSorts = currentView?.viewSorts ?? [];

        const currentRecordSorts = getSnapshotValue(
          snapshot,
          currentRecordSortsCallbackState,
        );

        const newViewSorts = currentRecordSorts.map((recordSort) =>
          mapRecordSortToViewSort(recordSort, currentView.id),
        );

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

        await createViewSorts(viewSortsToCreate, currentView);
        await updateViewSorts(viewSortsToUpdate);
        await deleteViewSorts(viewSortsToDelete);
      },
    [
      canPersistChanges,
      currentView,
      currentRecordSortsCallbackState,
      createViewSorts,
      updateViewSorts,
      deleteViewSorts,
    ],
  );

  return {
    saveRecordSortsToViewSorts,
  };
};
