import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useUpsertRecordsInStore = () => {
  const upsertRecords = useRecoilCallback(
    ({ set, snapshot }) =>
      (records: ObjectRecord[]) => {
        for (const record of records) {
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(record.id))
            .getValue();

          if (JSON.stringify(currentRecord) !== JSON.stringify(record)) {
            set(recordStoreFamilyState(record.id), record);
          }
        }
      },
    [],
  );

  return {
    upsertRecords,
  };
};
