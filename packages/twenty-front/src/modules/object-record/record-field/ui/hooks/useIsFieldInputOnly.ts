import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldInputOnly } from '@/object-record/record-field/ui/types/guards/isFieldInputOnly';

export const useIsFieldInputOnly = () => {
  const { fieldDefinition } = useContext(FieldContext);

  return isFieldInputOnly(fieldDefinition);
};
