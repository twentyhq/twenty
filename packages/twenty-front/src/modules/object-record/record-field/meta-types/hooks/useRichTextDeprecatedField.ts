import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldRichTextDeprecatedValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { isFieldRichTextDeprecated } from '@/object-record/record-field/types/guards/isFieldRichTextDeprecated';
import { isFieldRichTextDeprecatedValue } from '@/object-record/record-field/types/guards/isFieldRichTextDeprecatedValue';
import { PartialBlock } from '@blocknote/core';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useRichTextDeprecatedField = () => {
  const { recordId, fieldDefinition, hotkeyScope, maxWidth } =
    useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RichTextDeprecated,
    isFieldRichTextDeprecated,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] =
    useRecoilState<FieldRichTextDeprecatedValue>(
      recordStoreFamilySelector({
        recordId,
        fieldName: fieldName,
      }),
    );
  const fieldRichTextDeprecatedValue = isFieldRichTextDeprecatedValue(
    fieldValue,
  )
    ? fieldValue
    : '';

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldRichTextDeprecatedValue>(
      `${recordId}-${fieldName}`,
    );

  const draftValue = useRecoilValue(getDraftValueSelector());

  const draftValueParsed: PartialBlock[] = isNonEmptyString(draftValue)
    ? JSON.parse(draftValue)
    : draftValue;

  const persistField = usePersistField();

  const persistRichTextDeprecatedField = (nextValue: PartialBlock[]) => {
    if (!nextValue) {
      persistField(null);
    } else {
      const parsedValueToPersist = JSON.stringify(nextValue);

      persistField(parsedValueToPersist);
    }
  };

  return {
    draftValue: draftValueParsed,
    setDraftValue,
    maxWidth,
    fieldDefinition,
    fieldValue: fieldRichTextDeprecatedValue,
    setFieldValue,
    hotkeyScope,
    persistRichTextDeprecatedField,
  };
};
