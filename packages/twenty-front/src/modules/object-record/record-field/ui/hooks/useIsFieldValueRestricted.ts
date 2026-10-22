import { useContext } from 'react';
import { isFieldValueRestricted } from 'twenty-shared/utils';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';

export const useIsFieldValueRestricted = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const fieldValue = useRecordFieldValue(
    recordId,
    fieldDefinition.metadata.fieldName,
    fieldDefinition,
  );

  return isFieldValueRestricted(fieldValue);
};
