import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FieldContext } from '../../contexts/FieldContext';

export const useTextFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Text, isFieldText, fieldDefinition);
  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue =
    useRecordFieldValue<string | undefined>(recordId, fieldName) ?? '';

  return {
    fieldDefinition,
    fieldValue,
    hotkeyScope,
  };
};
