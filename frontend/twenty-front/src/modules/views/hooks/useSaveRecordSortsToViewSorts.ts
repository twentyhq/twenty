import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
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

  const currentRecordSortsCallbackState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const store = useStore();

  const saveRecordSortsToViewSorts = useCallback(async () => {
    if (!canPersistChanges || !isDefined(currentView)) {
      return;
    }

    const currentViewSorts = currentView?.viewSorts ?? [];

    const currentRecordSorts = store.get(currentRecordSortsCallbackState);

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

    const createViewSortInputs = viewSortsToCreate.map((viewSort) => ({
      input: {
        id: viewSort.id,
        fieldMetadataId: viewSort.fieldMetadataId,
        viewId: currentView.id,
        direction: viewSort.direction,
      },
    }));

    const updateViewSortInputs = viewSortsToUpdate.map((viewSort) => ({
      input: {
        id: viewSort.id,
        update: {
          direction: viewSort.direction,
        },
      },
    }));

    const deleteViewSortInputs = viewSortsToDelete.map((viewSort) => ({
      input: {
        id: viewSort.id,
      },
    }));

    const createResult = await performViewSortAPICreate(createViewSortInputs);
    if (createResult.status === 'failed') {
      return;
    }

    const updateResult = await performViewSortAPIUpdate(updateViewSortInputs);
    if (updateResult.status === 'failed') {
      return;
    }

    const deleteResult = await performViewSortAPIDelete(deleteViewSortInputs);
    if (deleteResult.status === 'failed') {
      return;
    }
  }, [
    canPersistChanges,
    currentView,
    store,
    currentRecordSortsCallbackState,
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
  ]);

  return {
    saveRecordSortsToViewSorts,
  };
};
