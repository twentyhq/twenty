import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useUpsertRecordSort = () => {
  const currentRecordSortsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordSortsComponentState,
  );

  const store = useStore();

  const upsertRecordSort = useCallback(
    (recordSortToSet: RecordSort) => {
      const currentRecordSorts = store.get(
        currentRecordSortsAtom,
      ) as RecordSort[];

      const hasFoundRecordSortInCurrentRecordSorts = currentRecordSorts.some(
        (existingSort) =>
          existingSort.fieldMetadataId === recordSortToSet.fieldMetadataId,
      );

      if (!hasFoundRecordSortInCurrentRecordSorts) {
        store.set(currentRecordSortsAtom, [
          ...currentRecordSorts,
          recordSortToSet,
        ]);
      } else {
        store.set(
          currentRecordSortsAtom,
          (currentRecordSorts: RecordSort[]) => {
            const newCurrentRecordSorts = [...currentRecordSorts];

            const indexOfSortToUpdate = newCurrentRecordSorts.findIndex(
              (existingSort) =>
                existingSort.fieldMetadataId ===
                recordSortToSet.fieldMetadataId,
            );

            if (indexOfSortToUpdate < 0) {
              return newCurrentRecordSorts;
            }

            newCurrentRecordSorts[indexOfSortToUpdate] = {
              ...recordSortToSet,
            };

            return newCurrentRecordSorts;
          },
        );
      }
    },
    [currentRecordSortsAtom, store],
  );

  return {
    upsertRecordSort,
  };
};
