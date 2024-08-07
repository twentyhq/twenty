import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useUpsertedPreviewRecord } from '@/settings/data-model/fields/preview/hooks/useUpsertedPreviewRecord';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from '~/utils/isDefined';

type SettingsDataModelSetFieldValueEffectProps = {
  recordId: string;
  fieldName: string;
  value: unknown;
};

export const SettingsDataModelSetFieldValueEffect = ({
  recordId,
  fieldName,
  value,
}: SettingsDataModelSetFieldValueEffectProps) => {
  const upsertedPreviewRecord = useUpsertedPreviewRecord();
  const setFieldValue = useSetRecoilState(
    recordStoreFamilySelector({
      recordId,
      fieldName,
    }),
  );
  const setRecordFieldValue = useSetRecordFieldValue();

  useEffect(() => {
    if (
      isDefined(upsertedPreviewRecord) &&
      !!upsertedPreviewRecord[fieldName]
    ) {
      setFieldValue(upsertedPreviewRecord[fieldName]);
      setRecordFieldValue(
        recordId,
        fieldName,
        upsertedPreviewRecord[fieldName],
      );
    } else {
      setFieldValue(value);
      setRecordFieldValue(recordId, fieldName, value);
    }
  }, [
    value,
    setFieldValue,
    setRecordFieldValue,
    recordId,
    fieldName,
    upsertedPreviewRecord,
  ]);

  return null;
};
