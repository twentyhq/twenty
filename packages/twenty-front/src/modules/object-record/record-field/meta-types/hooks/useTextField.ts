import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { FieldTextValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { isFieldTextValue } from '@/object-record/record-field/types/guards/isFieldTextValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useTextField = () => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldTextValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );
  const fieldTextValue = isFieldTextValue(fieldValue) ? fieldValue : '';

  const { setDraftValue } = useRecordFieldInput<FieldTextValue>();

  const draftValue = useRecoilComponentValueV2(
    recordFieldInputDraftValueComponentState,
  );

  return {
    draftValue,
    setDraftValue,
    maxWidth,
    fieldDefinition,
    fieldValue: fieldTextValue,
    setFieldValue,
  };
};
