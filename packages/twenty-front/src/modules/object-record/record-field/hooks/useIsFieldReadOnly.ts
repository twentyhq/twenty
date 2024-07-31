import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldCreatedBy } from '@/object-record/record-field/types/guards/isFieldCreatedBy';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';

export const useIsFieldReadOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    fieldDefinition.metadata.fieldName === 'noteTargets' ||
    fieldDefinition.metadata.fieldName === 'taskTargets' ||
    isFieldCreatedBy(fieldDefinition) ||
    isFieldRichText(fieldDefinition)
  );
};
