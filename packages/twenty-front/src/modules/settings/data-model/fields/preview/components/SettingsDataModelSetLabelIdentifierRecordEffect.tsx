import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { usePreviewRecord } from '@/settings/data-model/fields/preview/hooks/usePreviewRecord';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

type SettingsDataModelSetLabelIdentifierRecordEffectProps = {
  objectNameSingular: string;
  recordId: string;
};

export const SettingsDataModelSetLabelIdentifierRecordEffect = ({
  objectNameSingular,
  recordId,
}: SettingsDataModelSetLabelIdentifierRecordEffectProps) => {
  const recordPreviewForLabelIdentifier = usePreviewRecord({
    objectNameSingular: objectNameSingular,
  });

  const setRecord = useSetRecoilState(recordStoreFamilyState(recordId));

  useEffect(() => {
    setRecord(recordPreviewForLabelIdentifier);
  }, [recordPreviewForLabelIdentifier, setRecord, recordId]);

  return null;
};
