import { useEffect } from 'react';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useSetPreviewRecordId } from '@/settings/data-model/fields/preview/hooks/previewRecordIdHooks';

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
  const setPreviewRecordId = useSetPreviewRecordId();

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
