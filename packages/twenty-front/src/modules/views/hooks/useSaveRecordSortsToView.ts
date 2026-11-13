import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { usePerformViewSortApiPersist } from '@/views/hooks/internal/usePerformViewSortApiPersist';
import { type View } from '@/views/types/View';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useCallback } from 'react';

export const useSaveRecordSortsToView = () => {
  const {
    performViewSortApiCreate,
    performViewSortApiUpdate,
    performViewSortApiDestroy,
  } = usePerformViewSortApiPersist();

  const saveRecordSortsToView = useCallback(
    async ({
      view,
      recordSorts,
    }: {
      view: View;
      recordSorts: RecordSort[];
    }) => {
      const currentViewSorts = view.viewSorts ?? [];

      const newViewSorts = recordSorts.map(mapRecordSortToViewSort);

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
          viewId: view.id,
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
        return false;
      }

      const updateResult = await performViewSortApiUpdate(updateViewSortInputs);
      if (updateResult.status === 'failed') {
        return false;
      }

      const deleteResult = await performViewSortApiDestroy(
        destroyViewSortInputs,
      );
      if (deleteResult.status === 'failed') {
        return false;
      }

      return true;
    },
    [
      performViewSortApiCreate,
      performViewSortApiUpdate,
      performViewSortApiDestroy,
    ],
  );

  return { saveRecordSortsToView };
};
