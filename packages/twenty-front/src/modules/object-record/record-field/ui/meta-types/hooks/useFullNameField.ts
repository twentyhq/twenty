import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldInput } from '@/object-record/record-field/ui/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/ui/states/recordFieldInputDraftValueComponentState';
import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldFullName } from '@/object-record/record-field/ui/types/guards/isFieldFullName';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useFullNameField = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.FULL_NAME,
    isFieldFullName,
    fieldDefinition,
  );

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldFullNameValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue } = useRecordFieldInput<FieldFullNameValue>();

  const draftValue = useRecoilComponentValue(
    recordFieldInputDraftValueComponentState,
  );

  return {
    fieldDefinition,
    fieldValue,
    setFieldValue,
    draftValue,
    setDraftValue,
  };
};
