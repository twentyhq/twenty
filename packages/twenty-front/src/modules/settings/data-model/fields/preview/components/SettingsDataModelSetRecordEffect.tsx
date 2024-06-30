import { useEffect } from 'react';

import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type SettingsDataModelSetRecordEffectProps = {
  record: ObjectRecord;
};

export const SettingsDataModelSetRecordEffect = ({
  record,
}: SettingsDataModelSetRecordEffectProps) => {
  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecordsInStore([record]);
  }, [record, upsertRecordsInStore]);

  return null;
};
