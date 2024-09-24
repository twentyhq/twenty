import { useRecoilCallback } from 'recoil';

import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { unsavedToDeleteViewFilterIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentFamilyState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';
import { isDefined } from '~/utils/isDefined';

export const useDeleteCombinedViewFilters = (viewBarComponentId?: string) => {
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

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    currentViewIdComponentState,
    viewBarComponentId,
  );

  const { getViewFromCache } = useGetViewFromCache();

  const deleteCombinedViewFilter = useRecoilCallback(
    ({ snapshot, set }) =>
      async (fieldId: string) => {
        const currentViewId = getSnapshotValue(
          snapshot,
          currentViewIdCallbackState,
        );

        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersCallbackState({ viewId: currentViewId }),
        );

        const unsavedToDeleteViewFilterIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterIdsCallbackState({ viewId: currentViewId }),
        );

        if (!currentViewId) {
          return;
        }

        const currentView = await getViewFromCache(currentViewId);

        if (!currentView) {
          return;
        }

        const matchingFilterInCurrentView = currentView.viewFilters.find(
          (viewFilter) => viewFilter.id === fieldId,
        );

        const matchingFilterInUnsavedFilters = unsavedToUpsertViewFilters.find(
          (viewFilter) => viewFilter.id === fieldId,
        );

        if (isDefined(matchingFilterInUnsavedFilters)) {
          set(
            unsavedToUpsertViewFiltersCallbackState({ viewId: currentViewId }),
            unsavedToUpsertViewFilters.filter(
              (viewFilter) => viewFilter.id !== fieldId,
            ),
          );
        }

        if (isDefined(matchingFilterInCurrentView)) {
          set(
            unsavedToDeleteViewFilterIdsCallbackState({
              viewId: currentViewId,
            }),
            [
              ...new Set([
                ...unsavedToDeleteViewFilterIds,
                matchingFilterInCurrentView.id,
              ]),
            ],
          );
        }
      },
    [
      currentViewIdCallbackState,
      getViewFromCache,
      unsavedToDeleteViewFilterIdsCallbackState,
      unsavedToUpsertViewFiltersCallbackState,
    ],
  );

  return {
    deleteCombinedViewFilter,
  };
};
