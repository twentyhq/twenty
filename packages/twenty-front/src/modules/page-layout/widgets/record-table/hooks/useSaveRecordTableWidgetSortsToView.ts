import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { usePerformViewSortAPIPersist } from '@/views/hooks/internal/usePerformViewSortAPIPersist';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';
import { mapRecordSortToViewSort } from '@/views/utils/mapRecordSortToViewSort';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSaveRecordTableWidgetSortsToView = (viewId: string) => {
  const {
    performViewSortAPICreate,
    performViewSortAPIUpdate,
    performViewSortAPIDelete,
  } = usePerformViewSortAPIPersist();

  const store = useStore();

  const saveRecordTableWidgetSortsToView = useCallback(
    async (recordSorts: RecordSort[]) => {
      const views = store.get(viewsSelector.atom);
      const currentView = views.find((view) => view.id === viewId);

      if (!isDefined(currentView)) {
        return;
      }

      const currentViewSorts = currentView.viewSorts ?? [];
      const newViewSorts = recordSorts.map(mapRecordSortToViewSort);

      const viewSortsToCreate = getViewSortsToCreate(
        currentViewSorts,
        newViewSorts,
      );
      const viewSortsToUpdate = getViewSortsToUpdate(
        currentViewSorts,
        newViewSorts,
      );
      const viewSortsToDelete = getViewSortsToDelete(
        currentViewSorts,
        newViewSorts,
      );

      await performViewSortAPICreate(
        viewSortsToCreate.map((viewSort) => ({
          input: {
            id: viewSort.id,
            fieldMetadataId: viewSort.fieldMetadataId,
            viewId: currentView.id,
            direction: viewSort.direction,
          },
        })),
      );

      await performViewSortAPIUpdate(
        viewSortsToUpdate.map((viewSort) => ({
          input: {
            id: viewSort.id,
            update: {
              direction: viewSort.direction,
            },
          },
        })),
      );

      await performViewSortAPIDelete(
        viewSortsToDelete.map((viewSort) => ({
          input: {
            id: viewSort.id,
          },
        })),
      );
    },
    [
      store,
      viewId,
      performViewSortAPICreate,
      performViewSortAPIUpdate,
      performViewSortAPIDelete,
    ],
  );

  return { saveRecordTableWidgetSortsToView };
};
