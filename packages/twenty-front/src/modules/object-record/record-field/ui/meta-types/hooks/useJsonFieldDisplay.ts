import { useContext } from 'react';

import { type FieldJsonValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { useFormattedJsonFieldValue } from '@/object-record/record-field/ui/meta-types/hooks/useFormattedJsonFieldValue';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useJsonFieldDisplay = () => {
  const { recordId, fieldDefinition, maxWidth, isRecordFieldReadOnly } =
    useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldJsonValue | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  const formattedFieldValue = useFormattedJsonFieldValue({
    fieldValue,
  });

  return {
    maxWidth,
    fieldDefinition,
    fieldValue: formattedFieldValue,
    isRecordFieldReadOnly,
  };
};
