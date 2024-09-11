import { useRecoilCallback } from 'recoil';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { unsavedToDeleteViewFilterIdsComponentState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentState';
import { unsavedToUpsertViewFiltersComponentState } from '@/views/states/unsavedToUpsertViewFiltersComponentState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { isDefined } from '~/utils/isDefined';

export const useCombinedViewFilters = (viewBarComponentId?: string) => {
  const unsavedToUpsertViewFiltersCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFiltersComponentState,
      viewBarComponentId,
    );

  const unsavedToDeleteViewFilterIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterIdsComponentState,
      viewBarComponentId,
    );

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    currentViewIdComponentState,
    viewBarComponentId,
  );

  const { getViewFromCache } = useGetViewFromCache();

  const upsertCombinedViewFilter = useRecoilCallback(
    ({ snapshot, set }) =>
      async (upsertedFilter: Filter) => {
        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersCallbackState,
        );

        const unsavedToDeleteViewFilterIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterIdsCallbackState,
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

        const matchingFilterInCurrentView = currentView.viewFilters.find(
          (viewFilter) =>
            viewFilter.fieldMetadataId === upsertedFilter.fieldMetadataId,
        );

        const matchingFilterInUnsavedFilters = unsavedToUpsertViewFilters.find(
          (viewFilter) =>
            viewFilter.fieldMetadataId === upsertedFilter.fieldMetadataId,
        );

        if (isDefined(matchingFilterInUnsavedFilters)) {
          const updatedFilters = unsavedToUpsertViewFilters.map((viewFilter) =>
            viewFilter.fieldMetadataId ===
            matchingFilterInUnsavedFilters.fieldMetadataId
              ? { ...viewFilter, ...upsertedFilter, id: viewFilter.id }
              : viewFilter,
          );

          set(unsavedToUpsertViewFiltersCallbackState, updatedFilters);
          return;
        }

        if (isDefined(matchingFilterInCurrentView)) {
          set(unsavedToUpsertViewFiltersCallbackState, [
            ...unsavedToUpsertViewFilters,
            {
              ...matchingFilterInCurrentView,
              ...upsertedFilter,
              id: matchingFilterInCurrentView.id,
            },
          ]);
          set(
            unsavedToDeleteViewFilterIdsCallbackState,
            unsavedToDeleteViewFilterIds.filter(
              (id) => id !== matchingFilterInCurrentView.id,
            ),
          );
          return;
        }

        set(unsavedToUpsertViewFiltersCallbackState, [
          ...unsavedToUpsertViewFilters,
          {
            ...upsertedFilter,
            __typename: 'ViewFilter',
          } satisfies ViewFilter,
        ]);
      },
    [
      currentViewIdCallbackState,
      getViewFromCache,
      unsavedToDeleteViewFilterIdsCallbackState,
      unsavedToUpsertViewFiltersCallbackState,
    ],
  );
  const removeCombinedViewFilter = useRecoilCallback(
    ({ snapshot, set }) =>
      async (fieldId: string) => {
        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersCallbackState,
        );

        const unsavedToDeleteViewFilterIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterIdsCallbackState,
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

        const matchingFilterInCurrentView = currentView.viewFilters.find(
          (viewFilter) => viewFilter.id === fieldId,
        );

        const matchingFilterInUnsavedFilters = unsavedToUpsertViewFilters.find(
          (viewFilter) => viewFilter.id === fieldId,
        );

        if (isDefined(matchingFilterInUnsavedFilters)) {
          set(
            unsavedToUpsertViewFiltersCallbackState,
            unsavedToUpsertViewFilters.filter(
              (viewFilter) => viewFilter.id !== fieldId,
            ),
          );
        }

        if (isDefined(matchingFilterInCurrentView)) {
          set(unsavedToDeleteViewFilterIdsCallbackState, [
            ...new Set([
              ...unsavedToDeleteViewFilterIds,
              matchingFilterInCurrentView.id,
            ]),
          ]);
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
    upsertCombinedViewFilter,
    removeCombinedViewFilter,
  };
};
