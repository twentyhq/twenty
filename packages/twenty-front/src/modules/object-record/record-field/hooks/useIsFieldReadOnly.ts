import { useContext } from 'react';

import { isFieldActor } from '@/object-record/record-field/types/guards/isFieldActor';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { isFieldReadonlyFromObjectMetadataName } from '@/object-record/record-field/utils/isFieldReadonlyFromObjectMetadataName';
import { FieldContext } from '../contexts/FieldContext';

export const useIsFieldReadOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  const { metadata } = fieldDefinition;

  return (
    metadata.fieldName === 'noteTargets' ||
    metadata.fieldName === 'taskTargets' ||
    isFieldActor(fieldDefinition) ||
    isFieldRichText(fieldDefinition) ||
    isFieldReadonlyFromObjectMetadataName(
      metadata.fieldName,
      metadata.objectMetadataNameSingular,
    )
  );
};
