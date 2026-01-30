import { useContext } from 'react';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldDateMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useDateFieldDisplay = () => {
  const { recordId, fieldDefinition, clearable } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<string | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    // TODO: we have to use this because we removed the assertion that would have otherwise narrowed the type because
    // it impacts performance. We should find a way to assert the type in a way that doesn't impact performance.
    // Maybe a level above ?
    fieldDefinition: fieldDefinition as FieldDefinition<FieldDateMetadata>,
    fieldValue,
    clearable,
  };
};
