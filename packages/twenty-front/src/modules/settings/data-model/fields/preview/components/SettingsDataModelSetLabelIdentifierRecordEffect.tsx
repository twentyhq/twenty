import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { usePreviewRecord } from '@/settings/data-model/fields/preview/hooks/usePreviewRecord';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';
import { useEffect } from 'react';

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

  const setRecord = useSetFamilyRecoilStateV2(recordStoreFamilyState, recordId);

  useEffect(() => {
    setRecord(recordPreviewForLabelIdentifier);
  }, [recordPreviewForLabelIdentifier, setRecord, recordId]);

  return null;
};
