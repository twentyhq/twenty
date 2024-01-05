import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { isEntityFieldEditModeEmptyFamilySelector } from '@/object-record/field/states/selectors/isEntityFieldEditModeEmptyFamilySelector';

import { FieldContext } from '../contexts/FieldContext';

export const useIsFieldEditModeValueEmpty = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const isFieldEditModeValueEmpty = useRecoilValue(
    isEntityFieldEditModeEmptyFamilySelector({
      fieldDefinition: {
        type: fieldDefinition.type,
      },
      fieldName: fieldDefinition.metadata.fieldName,
      entityId,
    }),
  );

  return isFieldEditModeValueEmpty;
};
