import { useContext } from 'react';

import { type FieldRichTextV2Value } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRichTextV2 } from '@/object-record/record-field/ui/types/guards/isFieldRichTextV2';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useRichTextV2FieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RICH_TEXT_V2,
    isFieldRichTextV2,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldRichTextV2Value | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  return {
    fieldDefinition,
    fieldValue,
  };
};
