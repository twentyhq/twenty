import { useContext } from 'react';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';
import {
  FieldSelectMetadata,
  FieldSelectValue,
} from '../../types/FieldMetadata';

export const useSelectFieldDisplay = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValue(entityId, fieldName) as
    | FieldSelectValue
    | undefined;

  return {
    fieldDefinition: fieldDefinition as FieldDefinition<FieldSelectMetadata>,
    fieldValue,
  };
};
