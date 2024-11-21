import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldRichTextValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { isFieldRichTextValue } from '@/object-record/record-field/types/guards/isFieldRichTextValue';
import { PartialBlock } from '@blocknote/core';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useRichTextField = () => {
  const { recordId, fieldDefinition, hotkeyScope, maxWidth } =
    useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RichText,
    isFieldRichText,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldRichTextValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );
  const fieldRichTextValue = isFieldRichTextValue(fieldValue) ? fieldValue : '';

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldRichTextValue>(`${recordId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

  const draftValueParsed: PartialBlock[] = isNonEmptyString(draftValue)
    ? JSON.parse(draftValue)
    : draftValue;

  const persistField = usePersistField();

  const persistRichTextField = (nextValue: PartialBlock[]) => {
    if (!nextValue) persistField(null);

    const parsedValueToPersist = JSON.stringify(nextValue);

    try {
      persistField(parsedValueToPersist);
    } catch (error) {
      console.error('Failed to persist rich text field', error);
    }
  };

  return {
    draftValue: draftValueParsed,
    setDraftValue,
    maxWidth,
    fieldDefinition,
    fieldValue: fieldRichTextValue,
    setFieldValue,
    hotkeyScope,
    persistRichTextField,
  };
};
