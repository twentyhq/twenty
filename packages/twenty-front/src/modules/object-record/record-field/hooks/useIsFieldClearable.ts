import { useContext } from 'react';

import { isFieldDateTime } from '@/object-record/record-field/types/guards/isFieldDateTime';

import { FieldContext } from '../contexts/FieldContext';

// TODO: have a better clearable settings in metadata ?
// We might want to define what's clearable in the metadata
// Instead of passing it in the context
// See: https://github.com/twentyhq/twenty/issues/4403
export const useIsFieldClearable = (): boolean => {
  const { clearable, isLabelIdentifier, fieldDefinition } =
    useContext(FieldContext);

  const isDateField = isFieldDateTime(fieldDefinition);

  const fieldCanBeCleared =
    !isLabelIdentifier && !isDateField && clearable !== false;

  return fieldCanBeCleared;
};
