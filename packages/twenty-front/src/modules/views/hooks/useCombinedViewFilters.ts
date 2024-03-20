import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { ViewFilter } from '@/views/types/ViewFilter';
import { isDefined } from '~/utils/isDefined';

export const useCombinedViewFilters = (viewBarComponentId?: string) => {
  const {
    unsavedToUpsertViewFiltersState,
    unsavedToDeleteViewFilterIdsState,
    currentViewIdState,
  } = useViewStates(viewBarComponentId);

  const { getViewFromCache } = useGetViewFromCache();

  const upsertCombinedViewFilter = useRecoilCallback(
    ({ snapshot, set }) =>
      async (upsertedFilter: Filter) => {
        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersState,
        );

        const unsavedToDeleteViewFilterIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterIdsState,
        );

        const currentViewId = getSnapshotValue(snapshot, currentViewIdState);

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
            viewFilter.id === matchingFilterInUnsavedFilters.id
              ? { ...viewFilter, ...upsertedFilter }
              : viewFilter,
          );

          set(unsavedToUpsertViewFiltersState, updatedFilters);
          return;
        }

        if (isDefined(matchingFilterInCurrentView)) {
          set(unsavedToUpsertViewFiltersState, [
            ...unsavedToUpsertViewFilters,
            { ...matchingFilterInCurrentView, ...upsertedFilter },
          ]);
          set(
            unsavedToDeleteViewFilterIdsState,
            unsavedToDeleteViewFilterIds.filter(
              (id) => id !== matchingFilterInCurrentView.id,
            ),
          );
          return;
        }

        set(unsavedToUpsertViewFiltersState, [
          ...unsavedToUpsertViewFilters,
          {
            ...upsertedFilter,
            id: v4(),
            __typename: 'ViewFilter',
          } satisfies ViewFilter,
        ]);
      },
    [
      currentViewIdState,
      getViewFromCache,
      unsavedToDeleteViewFilterIdsState,
      unsavedToUpsertViewFiltersState,
    ],
  );
  const removeCombinedViewFilter = useRecoilCallback(
    ({ snapshot, set }) =>
      async (fieldMetadataId: string) => {
        const unsavedToUpsertViewFilters = getSnapshotValue(
          snapshot,
          unsavedToUpsertViewFiltersState,
        );

        const unsavedToDeleteViewFilterIds = getSnapshotValue(
          snapshot,
          unsavedToDeleteViewFilterIdsState,
        );

        const currentViewId = getSnapshotValue(snapshot, currentViewIdState);

        if (!currentViewId) {
          return;
        }

        const currentView = await getViewFromCache(currentViewId);

        if (!currentView) {
          return;
        }

        const matchingFilterInCurrentView = currentView.viewFilters.find(
          (viewFilter) => viewFilter.fieldMetadataId === fieldMetadataId,
        );

        const matchingFilterInUnsavedFilters = unsavedToUpsertViewFilters.find(
          (viewFilter) => viewFilter.fieldMetadataId === fieldMetadataId,
        );

        if (isDefined(matchingFilterInUnsavedFilters)) {
          set(
            unsavedToUpsertViewFiltersState,
            unsavedToUpsertViewFilters.filter(
              (viewFilter) => viewFilter.fieldMetadataId !== fieldMetadataId,
            ),
          );
        }

        if (isDefined(matchingFilterInCurrentView)) {
          set(unsavedToDeleteViewFilterIdsState, [
            ...new Set([
              ...unsavedToDeleteViewFilterIds,
              matchingFilterInCurrentView.id,
            ]),
          ]);
        }
      },
    [
      currentViewIdState,
      getViewFromCache,
      unsavedToDeleteViewFilterIdsState,
      unsavedToUpsertViewFiltersState,
    ],
  );
  return {
    upsertCombinedViewFilter,
    removeCombinedViewFilter,
  };
};
