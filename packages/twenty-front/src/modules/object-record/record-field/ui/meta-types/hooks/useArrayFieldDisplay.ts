import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldArrayMetadata,
  type FieldArrayValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useContext } from 'react';

export const useArrayFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValue<FieldArrayValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldArrayMetadata>,
    fieldValue,
  };
};
