import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

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
  const setFieldValue = useSetRecoilState(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName,
    }),
  );

  const setRecordFieldValue = useSetRecordFieldValue();

  useEffect(() => {
    setFieldValue(value);
    setRecordFieldValue(entityId, fieldName, value);
  }, [value, setFieldValue, setRecordFieldValue, entityId, fieldName]);

  return null;
};
