import { isSameRecordSortTarget } from '@/object-record/record-sort/utils/isSameRecordSortTarget';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useUpsertRecordSort = () => {
  const currentRecordSorts = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const store = useStore();

  const upsertRecordSort = useCallback(
    (recordSortToSet: RecordSort) => {
      const existingRecordSorts = store.get(currentRecordSorts) as RecordSort[];

      const hasFoundRecordSortInCurrentRecordSorts = existingRecordSorts.some(
        (existingSort) => isSameRecordSortTarget(existingSort, recordSortToSet),
      );

      if (!hasFoundRecordSortInCurrentRecordSorts) {
        store.set(currentRecordSorts, [
          ...existingRecordSorts,
          recordSortToSet,
        ]);
      } else {
        store.set(currentRecordSorts, (previousRecordSorts: RecordSort[]) => {
          const newCurrentRecordSorts = [...previousRecordSorts];

          const indexOfSortToUpdate = newCurrentRecordSorts.findIndex(
            (existingSort) =>
              isSameRecordSortTarget(existingSort, recordSortToSet),
          );

          if (indexOfSortToUpdate < 0) {
            return newCurrentRecordSorts;
          }

          newCurrentRecordSorts[indexOfSortToUpdate] = {
            ...recordSortToSet,
          };

          return newCurrentRecordSorts;
        });
      }
    },
    [currentRecordSorts, store],
  );

  return {
    upsertRecordSort,
  };
};
