import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { FieldContext } from '../contexts/FieldContext';
import { isEntityFieldEmptyFamilySelector } from '../states/selectors/isEntityFieldEmptyFamilySelector';

export const useIsFieldEmpty = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const fieldDefinitionWithoutIcon = { ...fieldDefinition };

  delete fieldDefinitionWithoutIcon.Icon;

  const isFieldEmpty = useRecoilValue(
    isEntityFieldEmptyFamilySelector({
      fieldDefinition: fieldDefinitionWithoutIcon,
      entityId,
    }),
  );

  return isFieldEmpty;
};
