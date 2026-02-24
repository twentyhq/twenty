import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { usePerformViewSortAPIPersist } from '@/views/hooks/internal/usePerformViewSortAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordSortsToViewSorts = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const {
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
  } = usePerformViewSortAPIPersist();

  const { currentView } = useGetCurrentViewOnly();

  const currentRecordSortsCallbackState =
    useRecoilComponentStateCallbackStateV2(currentRecordSortsComponentState);

  const store = useStore();

  const saveRecordSortsToViewSorts = useCallback(async () => {
    if (!canPersistChanges || !isDefined(currentView)) {
      return;
    }

    const currentViewSorts = currentView?.viewSorts ?? [];

    const currentRecordSorts = store.get(currentRecordSortsCallbackState);

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

    await performViewSortAPICreate(viewSortsToCreate, currentView);
    await performViewSortAPIUpdate(viewSortsToUpdate);
    await performViewSortAPIDelete(viewSortsToDelete);
  }, [
    store,
    canPersistChanges,
    currentView,
    currentRecordSortsCallbackState,
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
  ]);

  return {
    saveRecordSortsToViewSorts,
  };
};
