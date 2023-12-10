import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { entityFieldsFamilySelector } from '@/object-record/field/states/selectors/entityFieldsFamilySelector';

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
  const [, setFieldValue] = useRecoilState(
    entityFieldsFamilySelector({
      entityId,
      fieldName,
    }),
  );

  useEffect(() => {
    setFieldValue(value);
  }, [value, setFieldValue]);

  return null;
};
