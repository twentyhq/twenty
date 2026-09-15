import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect } from 'react';

type RecordListUpsertRecordsInStoreEffectProps = {
  records: ObjectRecord[];
};

export const RecordListUpsertRecordsInStoreEffect = ({
  records,
}: RecordListUpsertRecordsInStoreEffectProps) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecordsInStore({ partialRecords: records });
  }, [records, upsertRecordsInStore]);

  return null;
};
