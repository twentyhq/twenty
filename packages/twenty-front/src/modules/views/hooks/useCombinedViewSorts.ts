import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { ViewSort } from '@/views/types/ViewSort';
import { isDefined } from '~/utils/isDefined';

export const useCombinedViewSorts = (viewBarComponentId?: string) => {
  const {
    unsavedToUpsertViewSortsState,
    unsavedToDeleteViewSortIdsState,
    currentViewIdState,
  } = useViewStates(viewBarComponentId);

  const { getViewFromCache } = useGetViewFromCache();

  const upsertCombinedViewSort = useRecoilCallback(
    ({ snapshot, set }) =>
      async (upsertedSort: Sort) => {
        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsState,
        );

        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsState,
        );

        const currentViewId = getSnapshotValue(snapshot, currentViewIdState);

        if (!currentViewId) {
          return;
        }

        const currentView = await getViewFromCache(currentViewId);

        if (!currentView) {
          return;
        }

        const matchingSortInCurrentView = currentView.viewSorts.find(
          (viewSort) =>
            viewSort.fieldMetadataId === upsertedSort.fieldMetadataId,
        );

        const matchingSortInUnsavedSorts = unsavedToUpsertViewSorts.find(
          (viewSort) =>
            viewSort.fieldMetadataId === upsertedSort.fieldMetadataId,
        );

        if (isDefined(matchingSortInUnsavedSorts)) {
          const updatedSorts = unsavedToUpsertViewSorts.map((viewSort) =>
            viewSort.id === matchingSortInUnsavedSorts.id
              ? { ...viewSort, ...upsertedSort }
              : viewSort,
          );

          set(unsavedToUpsertViewSortsState, updatedSorts);
          return;
        }

        if (isDefined(matchingSortInCurrentView)) {
          set(unsavedToUpsertViewSortsState, [
            ...unsavedToUpsertViewSorts,
            { ...matchingSortInCurrentView, ...upsertedSort },
          ]);
          set(
            unsavedToDeleteViewSortIdsState,
            unsavedToDeleteViewSortIds.filter(
              (id) => id !== matchingSortInCurrentView.id,
            ),
          );
          return;
        }

        set(unsavedToUpsertViewSortsState, [
          ...unsavedToUpsertViewSorts,
          {
            ...upsertedSort,
            id: v4(),
            __typename: 'ViewSort',
          } satisfies ViewSort,
        ]);
      },
    [
      currentViewIdState,
      getViewFromCache,
      unsavedToDeleteViewSortIdsState,
      unsavedToUpsertViewSortsState,
    ],
  );
  const removeCombinedViewSort = useRecoilCallback(
    ({ snapshot, set }) =>
      async (fieldMetadataId: string) => {
        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsState,
        );

        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsState,
        );

        const currentViewId = getSnapshotValue(snapshot, currentViewIdState);

        if (!currentViewId) {
          return;
        }

        const currentView = await getViewFromCache(currentViewId);

        if (!currentView) {
          return;
        }

        const matchingSortInCurrentView = currentView.viewSorts.find(
          (viewSort) => viewSort.fieldMetadataId === fieldMetadataId,
        );

        const matchingSortInUnsavedSorts = unsavedToUpsertViewSorts.find(
          (viewSort) => viewSort.fieldMetadataId === fieldMetadataId,
        );

        if (isDefined(matchingSortInUnsavedSorts)) {
          set(
            unsavedToUpsertViewSortsState,
            unsavedToUpsertViewSorts.filter(
              (viewSort) => viewSort.fieldMetadataId !== fieldMetadataId,
            ),
          );
          return;
        }

        if (isDefined(matchingSortInCurrentView)) {
          set(unsavedToDeleteViewSortIdsState, [
            ...new Set([
              ...unsavedToDeleteViewSortIds,
              matchingSortInCurrentView.id,
            ]),
          ]);
        }
      },
    [
      currentViewIdState,
      getViewFromCache,
      unsavedToDeleteViewSortIdsState,
      unsavedToUpsertViewSortsState,
    ],
  );
  return {
    upsertCombinedViewSort,
    removeCombinedViewSort,
  };
};
