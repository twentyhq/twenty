import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { settingsPreviewRecordIdState } from '@/settings/data-model/fields/preview/states/settingsPreviewRecordIdState';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsDataModelSetPreviewRecordEffectProps = {
  record: ObjectRecord;
  fieldName: string;
};

export const SettingsDataModelSetPreviewRecordEffect = ({
  record,
  fieldName,
}: SettingsDataModelSetPreviewRecordEffectProps) => {
  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();
  const setRecordFieldValue = useSetRecordFieldValue();

  const setSettingsPreviewRecordId = useSetRecoilState(
    settingsPreviewRecordIdState,
  );

  useEffect(() => {
    upsertRecordsInStore([record]);
    setRecordFieldValue(record.id, fieldName, record[fieldName]);
    setSettingsPreviewRecordId(record.id);
  }, [
    record,
    upsertRecordsInStore,
    setRecordFieldValue,
    fieldName,
    setSettingsPreviewRecordId,
  ]);

  return null;
};
