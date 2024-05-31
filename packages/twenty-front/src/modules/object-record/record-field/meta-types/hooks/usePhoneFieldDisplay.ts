import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';

export const usePhoneFieldDisplay = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue(entityId, fieldName);

  return {
    fieldDefinition,
    fieldValue,
    hotkeyScope,
  };
};
