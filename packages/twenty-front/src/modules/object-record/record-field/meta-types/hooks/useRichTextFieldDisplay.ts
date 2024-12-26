import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldRichTextValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { PartialBlock } from '@blocknote/core';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { parseJson } from '~/utils/parseJson';
import { FieldContext } from '../../contexts/FieldContext';

export const useRichTextFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RichText,
    isFieldRichText,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldRichTextValue | undefined>(
    recordId,
    fieldName,
  );

  const fieldValueParsed = parseJson<PartialBlock[]>(fieldValue);

  return {
    fieldDefinition,
    fieldValue: fieldValueParsed,
    hotkeyScope,
  };
};
