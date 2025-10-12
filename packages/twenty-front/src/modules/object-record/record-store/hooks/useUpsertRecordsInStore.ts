import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useUpsertRecordsInStore = () => {
  const upsertRecordsInStore = useRecoilCallback(
    ({ set, snapshot }) =>
      (records: ObjectRecord[]) => {
        for (const record of records) {
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(record.id))
            .getValue();

          if (!isDeeplyEqual(currentRecord, record)) {
            set(recordStoreFamilyState(record.id), {
              ...currentRecord,
              ...record,
            });
          }
        }
      },
    [],
  );

  return {
    upsertRecordsInStore,
  };
};
