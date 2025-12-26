import { useContext } from 'react';

import { type FieldEmailsValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldMetadataType } from 'twenty-shared/types';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useEmailsFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.EMAILS, isFieldEmails, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldEmailsValue | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
