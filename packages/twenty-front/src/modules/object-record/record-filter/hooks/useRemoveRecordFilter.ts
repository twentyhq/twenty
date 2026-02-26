import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRemoveRecordFilter = () => {
  const currentRecordFilters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );

  const store = useStore();
  const { onUpdate } = useContext(AdvancedFilterContext);

  const removeRecordFilterCallback = useCallback(
    ({ recordFilterId }: { recordFilterId: string }) => {
      const existingRecordFilters = store.get(
        currentRecordFilters,
      ) as RecordFilter[];

      const filterToRemove = existingRecordFilters.find(
        (existingFilter) => existingFilter.id === recordFilterId,
      );

      if (!isDefined(filterToRemove)) {
        return;
      }

      store.set(
        currentRecordFilters,
        (previousRecordFilters: RecordFilter[]) => {
          const newCurrentRecordFilters = [...previousRecordFilters];

          const indexOfFilterToRemove = newCurrentRecordFilters.findIndex(
            (existingFilter) => existingFilter.id === recordFilterId,
          );

          newCurrentRecordFilters.splice(indexOfFilterToRemove, 1);

          return newCurrentRecordFilters;
        },
      );
    },
    [currentRecordFilters, store],
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
