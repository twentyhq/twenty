import { useContext } from 'react';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FieldContext } from '../contexts/FieldContext';
import { isFieldCreatedBy } from '@/object-record/record-field/types/guards/isFieldCreatedBy';

export const useIsFieldReadOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    isFieldCreatedBy(fieldDefinition) ||
    fieldDefinition.type === FieldMetadataType.RichText ||
    fieldDefinition.metadata.fieldName === 'noteTargets' ||
    fieldDefinition.metadata.fieldName === 'taskTargets' // TODO: do something cleaner
  );
};
