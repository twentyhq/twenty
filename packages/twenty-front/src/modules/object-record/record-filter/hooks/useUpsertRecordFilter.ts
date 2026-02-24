import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';

export const useUpsertRecordFilter = () => {
  const currentRecordFiltersAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFiltersComponentState,
  );

  const store = useStore();
  const { onUpdate } = useContext(AdvancedFilterContext);

  const upsertRecordFilterCallback = useCallback(
    (recordFilterToSet: RecordFilter) => {
      const currentRecordFilters = store.get(
        currentRecordFiltersAtom,
      ) as RecordFilter[];

      const foundRecordFilterInCurrentRecordFilters = currentRecordFilters.some(
        (existingFilter) => existingFilter.id === recordFilterToSet.id,
      );

      if (!foundRecordFilterInCurrentRecordFilters) {
        store.set(currentRecordFiltersAtom, [
          ...currentRecordFilters,
          recordFilterToSet,
        ]);
      } else {
        store.set(
          currentRecordFiltersAtom,
          (currentRecordFilters: RecordFilter[]) => {
            const newCurrentRecordFilters = [...currentRecordFilters];

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
    [currentRecordFiltersAtom, store],
  );

  const upsertRecordFilter = (recordFilterToSet: RecordFilter) => {
    upsertRecordFilterCallback(recordFilterToSet);
    onUpdate?.();
  };

  return {
    upsertRecordFilter,
  };
};
