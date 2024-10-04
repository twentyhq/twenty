import { useContext } from 'react';

import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { FieldContext } from '../contexts/FieldContext';

export const useIsFieldReadOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    fieldDefinition.metadata.fieldName === 'noteTargets' ||
    fieldDefinition.metadata.fieldName === 'taskTargets' ||
    isFieldActor(fieldDefinition) ||
    isFieldRichText(fieldDefinition)
  );
};
