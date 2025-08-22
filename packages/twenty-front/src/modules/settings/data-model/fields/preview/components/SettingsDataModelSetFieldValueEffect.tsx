import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { settingsPreviewRecordIdState } from '@/settings/data-model/fields/preview/states/settingsPreviewRecordIdState';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type SettingsDataModelSetFieldValueEffectProps = {
  recordId: string;
  gqlFieldName: string;
  value: unknown;
};

export const SettingsDataModelSetFieldValueEffect = ({
  recordId,
  gqlFieldName,
  value,
}: SettingsDataModelSetFieldValueEffectProps) => {
  const settingsPreviewRecordId = useRecoilValue(settingsPreviewRecordIdState);

  const upsertedPreviewRecord = useRecoilValue(
    recordStoreFamilyState(settingsPreviewRecordId ?? ''),
  );

  const setFieldValue = useSetRecoilState(
    recordStoreFamilySelector({
      recordId,
      fieldName: gqlFieldName,
    }),
  );

  useEffect(() => {
    if (
      isDefined(upsertedPreviewRecord) &&
      !!upsertedPreviewRecord[gqlFieldName]
    ) {
      setFieldValue(upsertedPreviewRecord[gqlFieldName]);
    } else {
      setFieldValue(value);
    }
  }, [value, setFieldValue, recordId, gqlFieldName, upsertedPreviewRecord]);

  return null;
};
