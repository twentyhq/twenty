import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useAssignRecordsToStore = () => {
  const assignRecordsToStore = useRecoilCallback(
    ({ set, snapshot }) =>
      <T extends ObjectRecord>({ records }: { records: T[] }) => {
        for (const record of records) {
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(record.id))
            .getValue();

          if (!isDeeplyEqual(currentRecord, record)) {
            const newRecord = {
              ...currentRecord,
              ...record,
            };

            set(recordStoreFamilyState(record.id), newRecord);
          }
        }
      },
    [],
  );

  return {
    assignRecordsToStore,
  };
};
