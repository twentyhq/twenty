import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldBoolean } from '@/object-record/record-field/ui/types/guards/isFieldBoolean';
import { isFieldRating } from '@/object-record/record-field/ui/types/guards/isFieldRating';

export const useIsFieldInputOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return isFieldBoolean(fieldDefinition) || isFieldRating(fieldDefinition);
};
