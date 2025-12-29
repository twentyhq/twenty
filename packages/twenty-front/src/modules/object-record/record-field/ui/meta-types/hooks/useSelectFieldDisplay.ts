import { useContext } from 'react';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  type FieldSelectMetadata,
  type FieldSelectValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';

export const useSelectFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValue<FieldSelectValue | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldSelectMetadata>,
    fieldValue,
  };
};
