import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect } from 'react';

type UpsertRecordsInStoreEffectProps = {
  records: ObjectRecord[];
};

export const UpsertRecordsInStoreEffect = ({
  records,
}: UpsertRecordsInStoreEffectProps) => {
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecordsInStore({ partialRecords: records });
  }, [records, upsertRecordsInStore]);

  return null;
};
