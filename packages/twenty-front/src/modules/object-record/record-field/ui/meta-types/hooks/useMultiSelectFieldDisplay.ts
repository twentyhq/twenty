import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMultiSelectMetadata,
  type FieldMultiSelectValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordFieldValueV2 } from '@/object-record/record-store/hooks/useRecordFieldValueV2';

export const useMultiSelectFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValueV2<FieldMultiSelectValue | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition:
      fieldDefinition as FieldDefinition<FieldMultiSelectMetadata>,
    fieldValue,
  };
};
