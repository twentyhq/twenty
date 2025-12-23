import { useContext } from 'react';

import { type FieldRichTextValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRichText } from '@/object-record/record-field/ui/types/guards/isFieldRichText';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import type { PartialBlock } from '@blocknote/core';
import { isDefined, parseJson } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

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
    fieldDefinition,
  );

  const fieldValueParsed = isDefined(fieldValue)
    ? parseJson<PartialBlock[]>(fieldValue)
    : null;

  return {
    fieldDefinition,
    fieldValue: fieldValueParsed,
  };
};
