import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { vectorSearchInputComponentState } from '@/views/states/vectorSearchInputComponentState';
import { isVectorSearchFilter } from '@/views/utils/isVectorSearchFilter';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRecordFilter = () => {
  const currentRecordFiltersCallbackState = useRecoilComponentCallbackState(
    currentRecordFiltersComponentState,
  );

  const { onUpdate } = useContext(AdvancedFilterContext);

  const removeRecordFilterCallback = useRecoilCallback(
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

  const removeRecordFilter = ({
    recordFilterId,
  }: {
    recordFilterId: string;
  }) => {
    removeRecordFilterCallback({ recordFilterId });
    onUpdate?.();
  };

  return {
    removeRecordFilter,
  };
};
