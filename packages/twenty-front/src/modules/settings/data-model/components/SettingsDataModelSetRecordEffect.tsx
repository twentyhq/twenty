import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

type SettingsDataModelSetRecordEffectProps = {
  record: ObjectRecord;
};

export const SettingsDataModelSetRecordEffect = ({
  record,
}: SettingsDataModelSetRecordEffectProps) => {
  const setRecord = useSetRecoilState(recordStoreFamilyState(record.id));

  useEffect(() => {
    setRecord(record);
  }, [record, setRecord]);

  return null;
};
