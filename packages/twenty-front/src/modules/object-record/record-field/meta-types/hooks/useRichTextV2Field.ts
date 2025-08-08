import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import {
  FieldRichTextV2Value,
  FieldRichTextValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { isFieldRichTextV2 } from '@/object-record/record-field/types/guards/isFieldRichTextV2';
import { isFieldRichTextV2Value } from '@/object-record/record-field/types/guards/isFieldRichTextValueV2';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import type { PartialBlock } from '@blocknote/core';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useRichTextV2Field = () => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RICH_TEXT_V2,
    isFieldRichTextV2,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldRichTextValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );
  const fieldRichTextV2Value = isFieldRichTextV2Value(fieldValue)
    ? fieldValue
    : ({ blocknote: null, markdown: null } as FieldRichTextV2Value);

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
    fieldValue: fieldRichTextV2Value,
    setFieldValue,
    persistRichTextField,
  };
};
