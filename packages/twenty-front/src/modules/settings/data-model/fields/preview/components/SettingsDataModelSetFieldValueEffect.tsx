import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

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
  const setFieldValue = useSetAtom(
    recordStoreFamilySelector.selectorFamily({
      recordId,
      fieldName: gqlFieldName,
    }),
  );

  useEffect(() => {
    setFieldValue(value);
  }, [value, setFieldValue, recordId, gqlFieldName]);

  return null;
};
