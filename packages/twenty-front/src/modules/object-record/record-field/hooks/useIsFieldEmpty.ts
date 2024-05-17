import { useContext } from 'react';

import { isFieldValueEmpty } from '@/object-record/record-field/utils/isFieldValueEmpty';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../contexts/FieldContext';

export const useIsFieldEmpty = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const fieldValue = useRecordFieldValue(
    entityId,
    fieldDefinition.metadata.fieldName,
  );

  return isFieldValueEmpty({
    fieldDefinition,
    fieldValue,
  });
};
