import { NUMBER_OF_VIRTUALIZED_ROWS } from '@/object-record/record-table/virtualization/constants/NumberOfVirtualizedRows';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useRecoilCallback } from 'recoil';

export const useResetNumberOfRecordsToVirtualize = () => {
  const totalNumberOfRecordsToVirtualizeCallbackState =
    useRecoilComponentCallbackState(
      totalNumberOfRecordsToVirtualizeComponentState,
    );

  const resetNumberOfRecordsToVirtualize = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        records,
        totalCount,
      }: {
        records: ObjectRecord[];
        totalCount: number;
      }) => {
        const totalNumberOfRecordsToVirtualize = getSnapshotValue(
          snapshot,
          totalNumberOfRecordsToVirtualizeCallbackState,
        );

        if (totalCount > NUMBER_OF_VIRTUALIZED_ROWS) {
          if (totalNumberOfRecordsToVirtualize !== totalCount) {
            set(totalNumberOfRecordsToVirtualizeCallbackState, totalCount);
          }
        } else {
          if (totalNumberOfRecordsToVirtualize !== records.length) {
            set(totalNumberOfRecordsToVirtualizeCallbackState, records.length);
          }
        }
      },
    [totalNumberOfRecordsToVirtualizeCallbackState],
  );

  return {
    resetNumberOfRecordsToVirtualize,
  };
};
