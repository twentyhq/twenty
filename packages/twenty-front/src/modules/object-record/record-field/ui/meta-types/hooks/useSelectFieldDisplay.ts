import { useContext } from 'react';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';
import {
  type FieldSelectMetadata,
  type FieldSelectValue,
} from '../../types/FieldMetadata';

export const useSelectFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValue<FieldSelectValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldSelectMetadata>,
    fieldValue,
  };
};
