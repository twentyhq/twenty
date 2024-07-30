import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldCreatedBy } from '@/object-record/record-field/types/guards/isFieldCreatedBy';

export const useIsFieldDisplayOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return isFieldCreatedBy(fieldDefinition);
};
