import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldRichTextValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import type { PartialBlock } from '@blocknote/core';
import { isDefined, parseJson } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FieldContext } from '../../contexts/FieldContext';

export const useRichTextFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RICH_TEXT,
    isFieldRichText,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldRichTextValue | undefined>(
    recordId,
    fieldName,
  );

  const fieldValueParsed = isDefined(fieldValue)
    ? parseJson<PartialBlock[]>(fieldValue)
    : null;

  return {
    fieldDefinition,
    fieldValue: fieldValueParsed,
  };
};
