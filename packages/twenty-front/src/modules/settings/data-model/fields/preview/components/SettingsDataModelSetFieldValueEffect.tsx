import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { previewRecordIdState } from '@/settings/data-model/fields/preview/states/previewRecordIdState';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
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
  const previewRecordId = useRecoilValue(previewRecordIdState);

  const upsertedPreviewRecord = useRecoilValue(
    recordStoreFamilyState(previewRecordId ?? ''),
  );

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
