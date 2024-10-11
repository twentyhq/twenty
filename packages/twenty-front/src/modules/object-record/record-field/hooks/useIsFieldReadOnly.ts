import { useContext } from 'react';

import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { FieldContext } from '../contexts/FieldContext';
import { isFieldMetadataReadOnly } from '../utils/isFieldMetadataReadOnly';

export const useIsFieldReadOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const { metadata } = fieldDefinition;

  return (
    isFieldActor(fieldDefinition) ||
    isFieldRichText(fieldDefinition) ||
    isFieldMetadataReadOnly(metadata)
  );
};
