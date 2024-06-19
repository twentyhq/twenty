import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';
import { FieldLinkValue } from '../../types/FieldMetadata';

export const useLinkFieldDisplay = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const fieldName = fieldDefinition.metadata.fieldName;
  const fieldValue = useRecordFieldValue<FieldLinkValue | undefined>(
    entityId,
    fieldName,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
