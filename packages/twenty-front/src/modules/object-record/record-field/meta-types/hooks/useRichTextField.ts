import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldRichTextValue } from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { isFieldRichText } from '@/object-record/record-field/types/guards/isFieldRichText';
import { isFieldRichTextValue } from '@/object-record/record-field/types/guards/isFieldRichTextValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import type { PartialBlock } from '@blocknote/core';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useRichTextField = () => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RICH_TEXT,
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

  const { setDraftValue } = useRecordFieldInput<FieldRichTextValue>();

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  const draftValueParsed: PartialBlock[] = isNonEmptyString(draftValue)
    ? JSON.parse(draftValue)
    : draftValue;

  const persistField = usePersistField();

  const persistRichTextField = (nextValue: PartialBlock[]) => {
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
    fieldValue: fieldRichTextValue,
    setFieldValue,
    persistRichTextField,
  };
};
