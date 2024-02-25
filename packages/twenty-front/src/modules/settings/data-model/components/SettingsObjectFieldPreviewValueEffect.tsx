import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

type SettingsObjectFieldPreviewValueEffectProps = {
  entityId: string;
  fieldName: string;
  value: unknown;
};

export const SettingsObjectFieldPreviewValueEffect = ({
  entityId,
  fieldName,
  value,
}: SettingsObjectFieldPreviewValueEffectProps) => {
  const setFieldValue = useSetRecoilState(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName,
    }),
  );

  useEffect(() => {
    setFieldValue(value);
  }, [value, setFieldValue]);

  return null;
};
