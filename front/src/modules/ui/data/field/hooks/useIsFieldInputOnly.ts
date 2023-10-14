import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldBoolean } from '../types/guards/isFieldBoolean';
import { isFieldProbability } from '../types/guards/isFieldProbability';

export const useIsFieldInputOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  if (isFieldBoolean(fieldDefinition) || isFieldProbability(fieldDefinition)) {
    return true;
  }

  return false;
};
