import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePersistViewSortRecords } from '@/views/hooks/internal/usePersistViewSortRecords';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordSortsToViewSorts = () => {
  const {
    createViewSortRecords,
    updateViewSortRecords,
    deleteViewSortRecords,
  } = usePersistViewSortRecords();

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
      },
    [
      createViewSortRecords,
      deleteViewSortRecords,
      updateViewSortRecords,
      currentRecordSortsCallbackState,
      currentView,
    ],
  );

  return {
    saveRecordSortsToViewSorts,
  };
};
