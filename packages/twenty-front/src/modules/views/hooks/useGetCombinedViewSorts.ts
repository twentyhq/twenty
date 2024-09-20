import { useRecoilCallback } from 'recoil';

import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
import { View } from '@/views/types/View';
import { getCombinedViewSorts } from '@/views/utils/getCombinedViewSorts';
import { isDefined } from '~/utils/isDefined';

// TODO: fix naming
export const useGetViewSortsCombined = (viewBarComponentId?: string) => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

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
        const view = views.find((view) => view.id === viewId);

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
      views,
      unsavedToDeleteViewSortIdsCallbackState,
      unsavedToUpsertViewSortsCallbackState,
    ],
  );

  return {
    getViewSortsCombined,
  };
};
