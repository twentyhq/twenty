import { useContext } from 'react';

import { FieldContext } from '../contexts/FieldContext';

// TODO: have a better clearable settings in metadata ?
export const useIsFieldClearable = () => {
  const { clearable, isLabelIdentifier, fieldDefinition } =
    useContext(FieldContext);

  const isDateField = fieldDefinition.type === 'DATE_TIME';

  return isLabelIdentifier || isDateField ? false : clearable ?? true;
};
