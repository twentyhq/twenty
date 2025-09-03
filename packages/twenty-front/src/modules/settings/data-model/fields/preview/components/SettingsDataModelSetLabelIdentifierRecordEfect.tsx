import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsDataModelSetLabelIdentifierRecordEffectProps = {
  record: ObjectRecord;
};

export const SettingsDataModelSetLabelIdentifierRecordEffect = ({
  record,
}: SettingsDataModelSetLabelIdentifierRecordEffectProps) => {
  const setRecord = useSetRecoilState(recordStoreFamilyState(record.id));

  useEffect(() => {
    setRecord(record);
  }, [record, setRecord]);

  return null;
};
