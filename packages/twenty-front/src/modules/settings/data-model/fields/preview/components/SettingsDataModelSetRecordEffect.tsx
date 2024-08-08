import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { previewRecordIdState } from '@/settings/data-model/fields/preview/states/previewRecordIdState';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsDataModelSetRecordEffectProps = {
  record: ObjectRecord;
  fieldName: string;
};

export const SettingsDataModelSetRecordEffect = ({
  record,
  fieldName,
}: SettingsDataModelSetRecordEffectProps) => {
  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();
  const setRecordFieldValue = useSetRecordFieldValue();

  const setPreviewRecordId = useSetRecoilState(previewRecordIdState);

  useEffect(() => {
    upsertRecordsInStore([record]);
    setRecordFieldValue(record.id, fieldName, record[fieldName]);
    setPreviewRecordId(record.id);
  }, [
    record,
    upsertRecordsInStore,
    setRecordFieldValue,
    fieldName,
    setPreviewRecordId,
  ]);

  return null;
};
