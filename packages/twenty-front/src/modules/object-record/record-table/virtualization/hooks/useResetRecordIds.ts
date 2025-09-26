import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const useResetRecordIds = () => {
  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const resetRecordIds = useRecoilCallback(
    ({ set }) =>
      ({ records }: { records: ObjectRecord[] }) => {
        const recordIds = records.map((record) => record.id);

        set(recordIndexAllRecordIdsSelector, recordIds);
      },
    [recordIndexAllRecordIdsSelector],
  );

  return {
    resetRecordIds,
  };
};
