import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const useAppendRecordIds = () => {
  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const appendRecordIds = useRecoilCallback(
    ({ set, snapshot }) =>
      ({ records }: { records: ObjectRecord[] }) => {
        const currentAllRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );

        const recordIds = records.map((record) => record.id);

        const newAllRecordIds = currentAllRecordIds.concat(recordIds);

        set(recordIndexAllRecordIdsSelector, newAllRecordIds);
      },
    [recordIndexAllRecordIdsSelector],
  );

  return {
    appendRecordIds,
  };
};
