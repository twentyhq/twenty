import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

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
  const setFieldValue = useSetRecoilState(
    recordStoreFamilySelector({
      recordId,
      fieldName: gqlFieldName,
    }),
  );

  useEffect(() => {
    setFieldValue(value);
  }, [value, setFieldValue, recordId, gqlFieldName]);

  return null;
};
