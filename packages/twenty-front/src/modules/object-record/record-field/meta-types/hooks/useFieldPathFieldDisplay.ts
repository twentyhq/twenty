import { useContext } from 'react';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';
import {
  FieldFieldPathMetadata,
  FieldFieldPathValue,
} from '../../types/FieldMetadata';

export const useFieldPathFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValue<FieldFieldPathValue | undefined>(
    recordId,
    fieldName,
  );

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldFieldPathMetadata>,
    fieldValue,
  };
};
