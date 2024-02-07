import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldRating } from '../types/guards/isFieldRating';

export const useIsFieldInputOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  if (isFieldBoolean(fieldDefinition) || isFieldRating(fieldDefinition)) {
    return true;
  }

  return false;
};
