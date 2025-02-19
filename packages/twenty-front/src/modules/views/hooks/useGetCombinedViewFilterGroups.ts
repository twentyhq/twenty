import { useRecoilCallback } from 'recoil';

import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { getCombinedViewFilterGroups } from '@/views/utils/getCombinedViewFilterGroups';
import { isDefined } from 'twenty-shared';

export const useGetViewFilterGroupsCombined = (viewBarComponentId?: string) => {
  const unsavedToUpsertViewFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFilterGroupsComponentFamilyState,
      viewBarComponentId,
    );

  const unsavedToDeleteViewFilterGroupIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterGroupIdsComponentFamilyState,
      viewBarComponentId,
    );

  const getViewFilterGroupsCombined = useRecoilCallback(
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

        const unsavedToUpsertViewFilterGroups = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFilterGroupsCallbackState({ viewId: view.id }),
        );

        const unsavedToDeleteViewFilterGroupIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterGroupIdsCallbackState({ viewId: view.id }),
        );

        const combinedViewFilterGroups = getCombinedViewFilterGroups(
          view.viewFilterGroups ?? [],
          unsavedToUpsertViewFilterGroups,
          unsavedToDeleteViewFilterGroupIds,
        );

        return combinedViewFilterGroups;
      },
    [
      unsavedToDeleteViewFilterGroupIdsCallbackState,
      unsavedToUpsertViewFilterGroupsCallbackState,
    ],
  );

  return {
    getViewFilterGroupsCombined,
  };
};
