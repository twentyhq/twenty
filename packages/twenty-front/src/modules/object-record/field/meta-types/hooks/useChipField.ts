import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { isFieldFullName } from '@/object-record/field/types/guards/isFieldFullName';
import { isFieldNumber } from '@/object-record/field/types/guards/isFieldNumber';
import { isFieldText } from '@/object-record/field/types/guards/isFieldText';

import { FieldContext } from '../../contexts/FieldContext';

export const useChipField = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const objectNameSingular =
    isFieldText(fieldDefinition) ||
    isFieldFullName(fieldDefinition) ||
    isFieldNumber(fieldDefinition)
      ? fieldDefinition.metadata.objectMetadataNameSingular
      : undefined;

  const record = useRecoilValue(entityFieldsFamilyState(entityId));

  return {
    objectNameSingular,
    record,
  };
};
