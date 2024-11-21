import { useContext } from 'react';

import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { FieldContext } from '../contexts/FieldContext';
import { isFieldMetadataReadOnly } from '../utils/isFieldMetadataReadOnly';

export const useIsFieldReadOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const { metadata } = fieldDefinition;

  return isFieldActor(fieldDefinition) || isFieldMetadataReadOnly(metadata);
};
