import { useContext } from 'react';

import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FieldContext } from '../contexts/FieldContext';

export const useIsFieldReadOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return (
    fieldDefinition.type === FieldMetadataType.RichText ||
    fieldDefinition.metadata.fieldName === 'noteTargets' ||
    fieldDefinition.metadata.fieldName === 'taskTargets' // TODO: do something cleaner
  );
};
