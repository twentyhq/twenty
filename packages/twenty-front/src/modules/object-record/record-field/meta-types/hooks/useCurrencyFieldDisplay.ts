import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';
import { FieldCurrencyValue } from '../../types/FieldMetadata';

export const useCurrencyFieldDisplay = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue(entityId, fieldName) as
    | FieldCurrencyValue
    | undefined;

  return {
    fieldDefinition,
    fieldValue,
  };
};
