import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';
import { isVectorSearchFilter } from '@/views/utils/isVectorSearchFilter';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRecordFilter = () => {
  const currentRecordFiltersCallbackState = useRecoilComponentCallbackStateV2(
    currentRecordFiltersComponentState,
  );

  const removeRecordFilter = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ recordFilterId }: { recordFilterId: string }) => {
        const currentRecordFilters = getSnapshotValue(
          snapshot,
          currentRecordFiltersCallbackState,
        );

        const filterToRemove = currentRecordFilters.find(
          (existingFilter) => existingFilter.id === recordFilterId,
        );

        if (!isDefined(filterToRemove)) {
          return;
        }

        if (isVectorSearchFilter(filterToRemove)) {
          set(
            vectorSearchInputComponentState.atomFamily({
              instanceId: VIEW_BAR_FILTER_DROPDOWN_ID,
            }),
            '',
          );
        }

        set(currentRecordFiltersCallbackState, (currentRecordFilters) => {
          const newCurrentRecordFilters = [...currentRecordFilters];

          const indexOfFilterToRemove = newCurrentRecordFilters.findIndex(
            (existingFilter) => existingFilter.id === recordFilterId,
          );

          newCurrentRecordFilters.splice(indexOfFilterToRemove, 1);

          return newCurrentRecordFilters;
        });
      },
    [currentRecordFiltersCallbackState],
  );

  return {
    removeRecordFilter,
  };
};
