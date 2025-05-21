import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { settingsPreviewRecordIdState } from '@/settings/data-model/fields/preview/states/settingsPreviewRecordIdState';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsDataModelSetPreviewRecordEffectProps = {
  record: ObjectRecord;
};

export const SettingsDataModelSetPreviewRecordEffect = ({
  record,
}: SettingsDataModelSetPreviewRecordEffectProps) => {
  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

  const setSettingsPreviewRecordId = useSetRecoilState(
    settingsPreviewRecordIdState,
  );

  useEffect(() => {
    upsertRecordsInStore([record]);
    setSettingsPreviewRecordId(record.id);
  }, [record, upsertRecordsInStore, setSettingsPreviewRecordId]);

  return null;
};
