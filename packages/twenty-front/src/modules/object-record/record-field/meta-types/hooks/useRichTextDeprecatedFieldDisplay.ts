import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldRichTextDeprecatedValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRichTextDeprecated } from '@/object-record/record-field/types/guards/isFieldRichTextDeprecated';
import { PartialBlock } from '@blocknote/core';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { parseJson } from '~/utils/parseJson';
import { FieldContext } from '../../contexts/FieldContext';

export const useRichTextDeprecatedFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RichTextDeprecated,
    isFieldRichTextDeprecated,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<
    FieldRichTextDeprecatedValue | undefined
  >(recordId, fieldName);

  const fieldValueParsed = parseJson<PartialBlock[]>(fieldValue);

  return {
    fieldDefinition,
    fieldValue: fieldValueParsed,
    hotkeyScope,
  };
};
