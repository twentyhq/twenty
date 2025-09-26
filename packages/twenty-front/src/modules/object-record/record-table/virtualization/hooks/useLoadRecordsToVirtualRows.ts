import { useRecoilCallback } from 'recoil';

import { hasAlreadyLoadedDataUpToRealIndexComponentState } from '@/object-record/record-table/virtualization/states/hasAlreadyLoadedDataUpToRealIndexComponentState';
import { recordIdByRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useLoadRecordsToVirtualRows = () => {
  const recordIdByRealIndexCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIdByRealIndexComponentFamilyState,
    );

  const hasAlreadyLoadedDataUpToRealIndexCallbackState =
    useRecoilComponentCallbackState(
      hasAlreadyLoadedDataUpToRealIndexComponentState,
    );

  const loadRecordsToVirtualRows = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        records,
        startingRealIndex,
      }: {
        records: ObjectRecord[];
        startingRealIndex: number;
      }) => {
        for (const [recordIndex, record] of records.entries()) {
          const realIndex = startingRealIndex + recordIndex;

          const currentRecordIdAtRealIndex = getSnapshotValue(
            snapshot,
            recordIdByRealIndexCallbackState({ realIndex }),
          );

          if (record.id !== currentRecordIdAtRealIndex) {
            set(recordIdByRealIndexCallbackState({ realIndex }), record.id);
          }
        }

        const newLastSetRealIndex = startingRealIndex + records.length;

        set(
          hasAlreadyLoadedDataUpToRealIndexCallbackState,
          newLastSetRealIndex,
        );
      },
    [
      recordIdByRealIndexCallbackState,
      hasAlreadyLoadedDataUpToRealIndexCallbackState,
    ],
  );

  return {
    loadRecordsToVirtualRows,
  };
};
