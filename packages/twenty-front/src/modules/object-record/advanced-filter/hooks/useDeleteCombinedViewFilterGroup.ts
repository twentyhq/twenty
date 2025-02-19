import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { isDefined } from 'twenty-shared';

export const useDeleteCombinedViewFilterGroup = (
  viewBarComponentId?: string,
) => {
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

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    contextStoreCurrentViewIdComponentState,
  );

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const deleteCombinedViewFilterGroup = useRecoilCallback(
    ({ snapshot, set }) =>
      async (filterGroupId: string) => {
        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

        const unsavedToUpsertViewFilterGroups = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFilterGroupsCallbackState({
            viewId: currentViewId,
          }),
        );

        const unsavedToDeleteViewFilterGroupIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterGroupIdsCallbackState({
            viewId: currentViewId,
          }),
        );

        if (!currentViewId) {
          return;
        }

        const currentView = await getViewFromPrefetchState(currentViewId);

        if (!currentView) {
          return;
        }

        const matchingFilterGroupInCurrentView =
          currentView.viewFilterGroups?.find(
            (viewFilterGroup) => viewFilterGroup.id === filterGroupId,
          );

        const matchingFilterGroupInUnsavedFilterGroups =
          unsavedToUpsertViewFilterGroups.find(
            (viewFilterGroup) => viewFilterGroup.id === filterGroupId,
          );

        if (isDefined(matchingFilterGroupInUnsavedFilterGroups)) {
          set(
            unsavedToUpsertViewFilterGroupsCallbackState({
              viewId: currentViewId,
            }),
            unsavedToUpsertViewFilterGroups.filter(
              (viewFilterGroup) => viewFilterGroup.id !== filterGroupId,
            ),
          );
        }

        if (isDefined(matchingFilterGroupInCurrentView)) {
          set(
            unsavedToDeleteViewFilterGroupIdsCallbackState({
              viewId: currentViewId,
            }),
            [
              ...new Set([
                ...unsavedToDeleteViewFilterGroupIds,
                matchingFilterGroupInCurrentView.id,
              ]),
            ],
          );
        }
      },
    [
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      unsavedToDeleteViewFilterGroupIdsCallbackState,
      unsavedToUpsertViewFilterGroupsCallbackState,
    ],
  );

  return {
    deleteCombinedViewFilterGroup,
  };
};
