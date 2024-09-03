import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilInstanceCallbackState } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceCallbackState';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdInstanceState } from '@/views/states/currentViewIdInstanceState';
import { unsavedToDeleteViewSortIdsInstanceState } from '@/views/states/unsavedToDeleteViewSortIdsInstanceState';
import { unsavedToUpsertViewSortsInstanceState } from '@/views/states/unsavedToUpsertViewSortsInstanceState';
import { ViewSort } from '@/views/types/ViewSort';
import { isDefined } from '~/utils/isDefined';

export const useCombinedViewSorts = (viewBarComponentId?: string) => {
  const currentViewIdCallbackState = useRecoilInstanceCallbackState(
    currentViewIdInstanceState,
    viewBarComponentId,
  );

  const unsavedToUpsertViewSortsCallbackState = useRecoilInstanceCallbackState(
    unsavedToUpsertViewSortsInstanceState,
    viewBarComponentId,
  );

  const unsavedToDeleteViewSortIdsCallbackState =
    useRecoilInstanceCallbackState(
      unsavedToDeleteViewSortIdsInstanceState,
      viewBarComponentId,
    );

  const { getViewFromCache } = useGetViewFromCache();

  const upsertCombinedViewSort = useRecoilCallback(
    ({ snapshot, set }) =>
      async (upsertedSort: Sort) => {
        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsCallbackState,
        );

        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsCallbackState,
        );

        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

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

          set(unsavedToUpsertViewSortsCallbackState, updatedSorts);
          return;
        }

        if (isDefined(matchingSortInCurrentView)) {
          set(unsavedToUpsertViewSortsCallbackState, [
            ...unsavedToUpsertViewSorts,
            { ...matchingSortInCurrentView, ...upsertedSort },
          ]);
          set(
            unsavedToDeleteViewSortIdsCallbackState,
            unsavedToDeleteViewSortIds.filter(
              (id) => id !== matchingSortInCurrentView.id,
            ),
          );
          return;
        }

        set(unsavedToUpsertViewSortsCallbackState, [
          ...unsavedToUpsertViewSorts,
          {
            ...upsertedSort,
            id: v4(),
            __typename: 'ViewSort',
          } satisfies ViewSort,
        ]);
      },
    [
      currentViewIdCallbackState,
      getViewFromCache,
      unsavedToDeleteViewSortIdsCallbackState,
      unsavedToUpsertViewSortsCallbackState,
    ],
  );
  const removeCombinedViewSort = useRecoilCallback(
    ({ snapshot, set }) =>
      async (fieldMetadataId: string) => {
        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsCallbackState,
        );

        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsCallbackState,
        );

        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

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
            unsavedToUpsertViewSortsCallbackState,
            unsavedToUpsertViewSorts.filter(
              (viewSort) => viewSort.fieldMetadataId !== fieldMetadataId,
            ),
          );
          return;
        }

        if (isDefined(matchingSortInCurrentView)) {
          set(unsavedToDeleteViewSortIdsCallbackState, [
            ...new Set([
              ...unsavedToDeleteViewSortIds,
              matchingSortInCurrentView.id,
            ]),
          ]);
        }
      },
    [
      currentViewIdCallbackState,
      getViewFromCache,
      unsavedToDeleteViewSortIdsCallbackState,
      unsavedToUpsertViewSortsCallbackState,
    ],
  );
  return {
    upsertCombinedViewSort,
    removeCombinedViewSort,
  };
};
