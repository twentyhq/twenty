import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FieldContext } from '../../contexts/FieldContext';

export const useTextFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope, wrap } =
    useContext(FieldContext);
  const inlineCellContext = useRecordInlineCellContext();

  assertFieldMetadata(FieldMetadataType.Text, isFieldText, fieldDefinition);
  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue =
    useRecordFieldValue<string | undefined>(recordId, fieldName) ?? '';

  return {
    fieldDefinition,
    fieldValue,
    hotkeyScope,
    wrap: inlineCellContext.wrap || wrap,
  };
};
