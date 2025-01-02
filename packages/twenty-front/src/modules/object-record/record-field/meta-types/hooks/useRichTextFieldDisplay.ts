import { useContext } from 'react';

import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldRichTextOldValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRichTextOld } from '@/object-record/record-field/types/guards/isFieldRichTextOld';
import { PartialBlock } from '@blocknote/core';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { parseJson } from '~/utils/parseJson';
import { FieldContext } from '../../contexts/FieldContext';

export const useRichTextOldFieldDisplay = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RichTextOld,
    isFieldRichTextOld,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldRichTextOldValue | undefined>(
    recordId,
    fieldName,
  );

  const fieldValueParsed = parseJson<PartialBlock[]>(fieldValue?.blocknote);

  return {
    fieldDefinition,
    fieldValue: fieldValueParsed,
    hotkeyScope,
  };
};
