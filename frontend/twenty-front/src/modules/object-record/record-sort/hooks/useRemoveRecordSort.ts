import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveRecordSort = () => {
  const currentRecordSorts = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const store = useStore();

  const removeRecordSort = useCallback(
    (fieldMetadataId: string) => {
      const existingRecordSorts = store.get(currentRecordSorts) as RecordSort[];

      const hasFoundRecordSortInCurrentRecordSorts = existingRecordSorts.some(
        (existingSort) => existingSort.fieldMetadataId === fieldMetadataId,
      );

      if (hasFoundRecordSortInCurrentRecordSorts) {
        store.set(currentRecordSorts, (previousRecordSorts: RecordSort[]) => {
          const newCurrentRecordSorts = [...previousRecordSorts];

          const indexOfSortToRemove = newCurrentRecordSorts.findIndex(
            (existingSort) => existingSort.fieldMetadataId === fieldMetadataId,
          );

          if (indexOfSortToRemove < 0) {
            return newCurrentRecordSorts;
          }

          newCurrentRecordSorts.splice(indexOfSortToRemove, 1);

          return newCurrentRecordSorts;
        });
      }
    },
    [currentRecordSorts, store],
  );

  return {
    removeRecordSort,
  };
};
