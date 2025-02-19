import { useRecoilCallback } from 'recoil';

import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { unsavedToDeleteViewFilterIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentFamilyState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';
import { getCombinedViewFilters } from '@/views/utils/getCombinedViewFilters';
import { isDefined } from 'twenty-shared';

export const useGetViewFiltersCombined = (viewBarComponentId?: string) => {
  const unsavedToUpsertViewFiltersCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFiltersComponentFamilyState,
      viewBarComponentId,
    );

  const unsavedToDeleteViewFilterIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterIdsComponentFamilyState,
      viewBarComponentId,
    );

  const getViewFiltersCombined = useRecoilCallback(
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

        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersCallbackState({ viewId: view.id }),
        );

        const unsavedToDeleteViewFilterIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterIdsCallbackState({ viewId: view.id }),
        );

        const combinedViewFilters = getCombinedViewFilters(
          view.viewFilters,
          unsavedToUpsertViewFilters,
          unsavedToDeleteViewFilterIds,
        );

        return combinedViewFilters;
      },
    [
      unsavedToDeleteViewFilterIdsCallbackState,
      unsavedToUpsertViewFiltersCallbackState,
    ],
  );

  return {
    getViewFiltersCombined,
  };
};
