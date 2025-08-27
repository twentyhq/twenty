import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldRating } from '../types/guards/isFieldRating';

export const useIsFieldInputOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return isFieldBoolean(fieldDefinition) || isFieldRating(fieldDefinition);
};
