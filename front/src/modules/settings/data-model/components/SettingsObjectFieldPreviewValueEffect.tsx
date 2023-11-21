import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { entityFieldsFamilySelector } from '@/ui/object/field/states/selectors/entityFieldsFamilySelector';

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
