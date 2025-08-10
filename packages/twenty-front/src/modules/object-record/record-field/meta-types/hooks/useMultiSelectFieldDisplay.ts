import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { type FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import {
  type FieldMultiSelectMetadata,
  type FieldMultiSelectValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

export const useMultiSelectFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValue<FieldMultiSelectValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition:
      fieldDefinition as FieldDefinition<FieldMultiSelectMetadata>,
    fieldValue,
  };
};
