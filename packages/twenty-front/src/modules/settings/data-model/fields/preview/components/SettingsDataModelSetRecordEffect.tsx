import { useEffect } from 'react';

import { useSetRecordInStore } from '@/object-record/record-store/hooks/useSetRecordInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type SettingsDataModelSetRecordEffectProps = {
  record: ObjectRecord;
};

export const SettingsDataModelSetRecordEffect = ({
  record,
}: SettingsDataModelSetRecordEffectProps) => {
  const { setRecords: setRecordsInStore } = useSetRecordInStore();

  useEffect(() => {
    setRecordsInStore([record]);
  }, [record, setRecordsInStore]);

  return null;
};
