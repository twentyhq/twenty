import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

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

        const foundRecordSortInCurrentRecordSorts = currentRecordSorts.some(
          (existingSort) =>
            existingSort.fieldMetadataId === recordSortToSet.fieldMetadataId,
        );

        if (!isDefined(foundRecordSortInCurrentRecordSorts)) {
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
