import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
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
    recordStoreFamilySelectorV2.selectorFamily({
      recordId,
      fieldName: gqlFieldName,
    }),
  );

  useEffect(() => {
    setFieldValue(value);
  }, [value, setFieldValue, recordId, gqlFieldName]);

  return null;
};
