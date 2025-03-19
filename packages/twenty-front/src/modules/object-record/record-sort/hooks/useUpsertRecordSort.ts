import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';

export const useUpsertRecordSort = () => {
  const currentRecordSortsCallbackState = useRecoilComponentCallbackStateV2(
    currentRecordSortsComponentState,
  );

  const upsertRecordSort = useRecoilCallback(
    ({ set, snapshot }) =>
      (recordSortToSet: RecordSort) => {
        const currentRecordSorts = getSnapshotValue(
          snapshot,
          currentRecordSortsCallbackState,
        );

        const hasFoundRecordSortInCurrentRecordSorts = currentRecordSorts.some(
          (existingSort) =>
            existingSort.fieldMetadataId === recordSortToSet.fieldMetadataId,
        );

        if (!hasFoundRecordSortInCurrentRecordSorts) {
          set(currentRecordSortsCallbackState, [
            ...currentRecordSorts,
            recordSortToSet,
          ]);
        } else {
          set(currentRecordSortsCallbackState, (currentRecordSorts) => {
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
          });
        }
      },
    [currentRecordSortsCallbackState],
  );

  return {
    upsertRecordSort,
  };
};
