import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useRemoveRecordSort = () => {
  const currentRecordSortsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordSortsComponentState,
  );

  const store = useStore();

  const removeRecordSort = useCallback(
    (fieldMetadataId: string) => {
      const currentRecordSorts = store.get(
        currentRecordSortsAtom,
      ) as RecordSort[];

      const hasFoundRecordSortInCurrentRecordSorts = currentRecordSorts.some(
        (existingSort) => existingSort.fieldMetadataId === fieldMetadataId,
      );

      if (hasFoundRecordSortInCurrentRecordSorts) {
        store.set(
          currentRecordSortsAtom,
          (currentRecordSorts: RecordSort[]) => {
            const newCurrentRecordSorts = [...currentRecordSorts];

            const indexOfSortToRemove = newCurrentRecordSorts.findIndex(
              (existingSort) =>
                existingSort.fieldMetadataId === fieldMetadataId,
            );

            if (indexOfSortToRemove < 0) {
              return newCurrentRecordSorts;
            }

            newCurrentRecordSorts.splice(indexOfSortToRemove, 1);

            return newCurrentRecordSorts;
          },
        );
      }
    },
    [currentRecordSortsAtom, store],
  );

  return {
    removeRecordSort,
  };
};
