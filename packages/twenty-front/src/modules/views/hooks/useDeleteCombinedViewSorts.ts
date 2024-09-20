import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
import { isDefined } from '~/utils/isDefined';

export const useDeleteCombinedViewSorts = (viewBarComponentId?: string) => {
  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    currentViewIdComponentState,
    viewBarComponentId,
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

  const { getViewFromCache } = useGetViewFromCache();

  const deleteCombinedViewSort = useRecoilCallback(
    ({ snapshot, set }) =>
      async (fieldMetadataId: string) => {
        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

        if (!currentViewId) {
          return;
        }

        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsCallbackState({ viewId: currentViewId }),
        );

        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsCallbackState({ viewId: currentViewId }),
        );

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
            unsavedToUpsertViewSortsCallbackState({ viewId: currentViewId }),
            unsavedToUpsertViewSorts.filter(
              (viewSort) => viewSort.fieldMetadataId !== fieldMetadataId,
            ),
          );
          return;
        }

        if (isDefined(matchingSortInCurrentView)) {
          set(
            unsavedToDeleteViewSortIdsCallbackState({ viewId: currentViewId }),
            [
              ...new Set([
                ...unsavedToDeleteViewSortIds,
                matchingSortInCurrentView.id,
              ]),
            ],
          );
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
    deleteCombinedViewSort,
  };
};
