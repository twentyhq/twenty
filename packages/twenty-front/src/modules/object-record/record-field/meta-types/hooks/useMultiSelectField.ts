import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext.ts';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField.ts';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput.ts';
import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata.ts';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata.ts';
import { isFieldMultiSelect } from '@/object-record/record-field/types/guards/isFieldMultiSelect.ts';
import { isFieldMultiSelectValue } from '@/object-record/record-field/types/guards/isFieldMultiSelectValue.ts';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector.ts';
import { FieldMetadataType } from '~/generated/graphql.tsx';

export const useMultiSelectField = () => {
  const { entityId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.MultiSelect,
    isFieldMultiSelect,
    fieldDefinition,
  );

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValues, setFieldValue] = useRecoilState<FieldMultiSelectValue>(
    recordStoreFamilySelector({
      recordId: entityId,
      fieldName: fieldName,
    }),
  );

  const fieldMultiSelectValues = isFieldMultiSelectValue(fieldValues)
    ? fieldValues
    : null;
  const persistField = usePersistField();

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldMultiSelectValue>(`${entityId}-${fieldName}`);
  const draftValue = useRecoilValue(getDraftValueSelector());

  return {
    fieldDefinition,
    persistField,
    fieldValues: fieldMultiSelectValues,
    draftValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
  };
};
