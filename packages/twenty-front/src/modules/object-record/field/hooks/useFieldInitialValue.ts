import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { FieldContext } from '../contexts/FieldContext';
import { entityFieldInitialValueFamilyState } from '../states/entityFieldInitialValueFamilyState';

export const useFieldInitialValue = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const fieldInitialValue = useRecoilValue(
    entityFieldInitialValueFamilyState({
      fieldMetadataId: fieldDefinition.fieldMetadataId,
      entityId,
    }),
  );

  return fieldInitialValue;
};
