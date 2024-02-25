import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useSetRecordInStore = () => {
  const setRecords = useRecoilCallback(
    ({ set, snapshot }) =>
      (records: ObjectRecord[]) => {
        records.forEach((record) => {
          const currentRecord = snapshot
            .getLoadable(recordStoreFamilyState(record.id))
            .valueOrThrow();

          if (JSON.stringify(currentRecord) !== JSON.stringify(record)) {
            set(recordStoreFamilyState(record.id), record);
          }
        });
      },
    [],
  );

  return {
    setRecords,
  };
};
