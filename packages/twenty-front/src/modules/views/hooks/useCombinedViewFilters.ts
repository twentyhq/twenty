import { useRecoilCallback } from 'recoil';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useRecoilInstanceCallbackState } from '@/ui/utilities/state/instance/hooks/useRecoilInstanceCallbackState';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdInstanceState } from '@/views/states/currentViewIdInstanceState';
import { unsavedToDeleteViewFilterIdsInstanceState } from '@/views/states/unsavedToDeleteViewFilterIdsInstanceState';
import { unsavedToUpsertViewFiltersInstanceState } from '@/views/states/unsavedToUpsertViewFiltersInstanceState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { isDefined } from '~/utils/isDefined';

export const useCombinedViewFilters = (viewBarComponentId?: string) => {
  const unsavedToUpsertViewFiltersCallbackState =
    useRecoilInstanceCallbackState(
      unsavedToUpsertViewFiltersInstanceState,
      viewBarComponentId,
    );

  const unsavedToDeleteViewFilterIdsCallbackState =
    useRecoilInstanceCallbackState(
      unsavedToDeleteViewFilterIdsInstanceState,
      viewBarComponentId,
    );

  const currentViewIdCallbackState = useRecoilInstanceCallbackState(
    currentViewIdInstanceState,
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
