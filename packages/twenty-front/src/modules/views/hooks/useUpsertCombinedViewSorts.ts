import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
import { ViewSort } from '@/views/types/ViewSort';
import { isDefined } from 'twenty-shared';

export const useUpsertCombinedViewSorts = (viewBarComponentId?: string) => {
  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    contextStoreCurrentViewIdComponentState,
  );

  const unsavedToUpsertViewSortsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewSortsComponentFamilyState,
      viewBarComponentId,
    );

  const unsavedToDeleteViewSortIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewSortIdsComponentFamilyState,
      viewBarComponentId,
    );

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const upsertCombinedViewSort = useRecoilCallback(
    ({ snapshot, set }) =>
      async (upsertedSort: RecordSort) => {
        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsCallbackState({ viewId: currentViewId }),
        );

        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsCallbackState({ viewId: currentViewId }),
        );

        if (!currentViewId) {
          return;
        }

        const currentView = await getViewFromPrefetchState(currentViewId);

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

          set(
            unsavedToUpsertViewSortsCallbackState({ viewId: currentViewId }),
            updatedSorts,
          );
          return;
        }

        if (isDefined(matchingSortInCurrentView)) {
          set(
            unsavedToUpsertViewSortsCallbackState({ viewId: currentViewId }),
            [
              ...unsavedToUpsertViewSorts,
              { ...matchingSortInCurrentView, ...upsertedSort },
            ],
          );
          set(
            unsavedToDeleteViewSortIdsCallbackState({ viewId: currentViewId }),
            unsavedToDeleteViewSortIds.filter(
              (id) => id !== matchingSortInCurrentView.id,
            ),
          );
          return;
        }

        set(unsavedToUpsertViewSortsCallbackState({ viewId: currentViewId }), [
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
      getViewFromPrefetchState,
      unsavedToDeleteViewSortIdsCallbackState,
      unsavedToUpsertViewSortsCallbackState,
    ],
  );

  return {
    upsertCombinedViewSort,
  };
};
