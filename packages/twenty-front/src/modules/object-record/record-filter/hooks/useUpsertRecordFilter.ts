import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';

export const useUpsertRecordFilter = () => {
  const currentRecordFilters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );

  const store = useStore();
  const { onUpdate } = useContext(AdvancedFilterContext);

  const upsertRecordFilterCallback = useCallback(
    (recordFilterToSet: RecordFilter) => {
      const existingRecordFilters = store.get(
        currentRecordFilters,
      ) as RecordFilter[];

      const foundRecordFilterInCurrentRecordFilters =
        existingRecordFilters.some(
          (existingFilter) => existingFilter.id === recordFilterToSet.id,
        );

      if (!foundRecordFilterInCurrentRecordFilters) {
        store.set(currentRecordFilters, [
          ...existingRecordFilters,
          recordFilterToSet,
        ]);
      } else {
        store.set(
          currentRecordFilters,
          (previousRecordFilters: RecordFilter[]) => {
            const newCurrentRecordFilters = [...previousRecordFilters];

            const indexOfFilterToUpdate = newCurrentRecordFilters.findIndex(
              (existingFilter) => existingFilter.id === recordFilterToSet.id,
            );

            newCurrentRecordFilters[indexOfFilterToUpdate] = {
              ...recordFilterToSet,
            };

            return newCurrentRecordFilters;
          },
        );
      }
    },
    [currentRecordFilters, store],
  );

  const upsertRecordFilter = (recordFilterToSet: RecordFilter) => {
    upsertRecordFilterCallback(recordFilterToSet);
    onUpdate?.();
  };

  return {
    upsertRecordFilter,
  };
};
