import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSetRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

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
  const setFieldValue = useSetRecoilState(
    recordStoreFamilySelector({
      recordId,
      fieldName,
    }),
  );

  const setRecordFieldValue = useSetRecordFieldValue();

  useEffect(() => {
    setFieldValue(value);
    setRecordFieldValue(recordId, fieldName, value);
  }, [value, setFieldValue, setRecordFieldValue, recordId, fieldName]);

  return null;
};
