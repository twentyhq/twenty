import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';
import { FieldCurrencyValue } from '../../types/FieldMetadata';

export const useCurrencyFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;
  
  console.log(fieldDefinition);
  const fieldValue = useRecordFieldValue<FieldCurrencyValue | undefined>(
    recordId,
    fieldName,
  );
  console.log(fieldValue);
  // here when we change only format, the changes reflect in fieldDefinition but not in fieldValue
  // that's why the UI is not updating and so thus save button.
  // I think this is beacuse when format change, the prev state is not changing that's why fieldValue is not updating.
  return {
    fieldDefinition,
    fieldValue,
  };
};

