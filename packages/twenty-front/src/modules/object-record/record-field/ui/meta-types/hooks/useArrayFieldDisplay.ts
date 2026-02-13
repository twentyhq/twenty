import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldArrayMetadata,
  type FieldArrayValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordFieldValueV2 } from '@/object-record/record-store/hooks/useRecordFieldValueV2';

import { useContext } from 'react';

export const useArrayFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValueV2<FieldArrayValue | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldArrayMetadata>,
    fieldValue,
  };
};
