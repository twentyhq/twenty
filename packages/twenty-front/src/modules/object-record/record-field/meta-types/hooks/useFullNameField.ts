import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { recordFieldInputDraftValueComponentState } from '@/object-record/record-field/states/recordFieldInputDraftValueComponentState';
import { FieldFullNameValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldFullName } from '@/object-record/record-field/types/guards/isFieldFullName';
import { isFieldFullNameValue } from '@/object-record/record-field/types/guards/isFieldFullNameValue';
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

  const persistField = usePersistField();

  const persistFullNameField = (newValue: FieldFullNameValue) => {
    if (!isFieldFullNameValue(newValue)) {
      return;
    }

    persistField(newValue);
  };

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
    persistFullNameField,
  };
};
