import { useRecoilCallback } from 'recoil';

import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
import { getCombinedViewSorts } from '@/views/utils/getCombinedViewSorts';
import { isDefined } from 'twenty-shared';

// TODO: fix naming
export const useGetViewSortsCombined = (viewBarComponentId?: string) => {
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

  const getViewSortsCombined = useRecoilCallback(
    ({ snapshot }) =>
      (viewId: string) => {
        const view = snapshot
          .getLoadable(
            prefetchViewFromViewIdFamilySelector({
              viewId,
            }),
          )
          .getValue();

        if (!isDefined(view)) {
          throw new Error(
            `Cannot get view with id ${viewId}, because it cannot be found in client cache data.`,
          );
        }

        const unsavedToUpsertViewSorts = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewSortsCallbackState({ viewId: view.id }),
        );

        const unsavedToDeleteViewSortIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewSortIdsCallbackState({ viewId: view.id }),
        );

        const combinedViewSorts = getCombinedViewSorts(
          view.viewSorts,
          unsavedToUpsertViewSorts,
          unsavedToDeleteViewSortIds,
        );

        return combinedViewSorts;
      },
    [
      unsavedToDeleteViewSortIdsCallbackState,
      unsavedToUpsertViewSortsCallbackState,
    ],
  );

  return {
    getViewSortsCombined,
  };
};
