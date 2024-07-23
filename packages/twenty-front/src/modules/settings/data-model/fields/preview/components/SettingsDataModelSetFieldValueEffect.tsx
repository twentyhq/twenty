import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useUpsertedPreviewRecord } from '@/settings/data-model/fields/preview/hooks/useUpsertedPreviewRecord';
import { isDefined } from '~/utils/isDefined';

type SettingsDataModelSetFieldValueEffectProps = {
  entityId: string;
  fieldName: string;
  value: unknown;
};

export const SettingsDataModelSetFieldValueEffect = ({
  entityId,
  fieldName,
  value,
}: SettingsDataModelSetFieldValueEffectProps) => {
  const upsertedPreviewRecord = useUpsertedPreviewRecord();
  const setFieldValue = useSetRecoilState(
    recordStoreFamilySelector({
      recordId: entityId,
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
        entityId,
        fieldName,
        upsertedPreviewRecord[fieldName],
      );
    } else {
      setFieldValue(value);
      setRecordFieldValue(entityId, fieldName, value);
    }
  }, [
    value,
    setFieldValue,
    setRecordFieldValue,
    entityId,
    fieldName,
    upsertedPreviewRecord,
  ]);

  return null;
};
