import { useContext } from 'react';

import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';
import {
  FieldDataExplorerQueryMetadata,
  FieldDataExplorerQueryValue,
} from '../../types/FieldMetadata';

export const useDataExplorerQueryFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { fieldName } = fieldDefinition.metadata;

  const fieldValue = useRecordFieldValue<
    FieldDataExplorerQueryValue | undefined
  >(recordId, fieldName);

  return {
    fieldDefinition:
      fieldDefinition as FieldDefinition<FieldDataExplorerQueryMetadata>,
    fieldValue,
  };
};
