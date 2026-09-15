import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewSortApiPersist } from '@/views/hooks/internal/usePerformViewSortApiPersist';
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
    performViewSortApiCreate,
    performViewSortApiUpdate,
    performViewSortApiDestroy,
  } = usePerformViewSortApiPersist();

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
        subFieldName: viewSort.subFieldName ?? null,
      },
    }));

    const updateViewSortInputs = viewSortsToUpdate.map((viewSort) => ({
      input: {
        id: viewSort.id,
        update: {
          direction: viewSort.direction,
          subFieldName: viewSort.subFieldName ?? null,
        },
      },
    }));

    const destroyViewSortInputs = viewSortsToDelete.map((viewSort) => ({
      input: {
        id: viewSort.id,
      },
    }));

    const createResult = await performViewSortApiCreate(createViewSortInputs);
    if (createResult.status === 'failed') {
      return;
    }

    const updateResult = await performViewSortApiUpdate(updateViewSortInputs);
    if (updateResult.status === 'failed') {
      return;
    }

    const deleteResult = await performViewSortApiDestroy(destroyViewSortInputs);
    if (deleteResult.status === 'failed') {
      return;
    }
  }, [
    canPersistChanges,
    currentView,
    store,
    currentRecordSortsCallbackState,
    performViewSortApiCreate,
    performViewSortApiUpdate,
    performViewSortApiDestroy,
  ]);

  return {
    saveRecordSortsToViewSorts,
  };
};
