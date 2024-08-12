import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { FieldSelectValue } from '../../types/FieldMetadata';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';
import { isFieldSelect } from '../../types/guards/isFieldSelect';
import { isFieldSelectValue } from '../../types/guards/isFieldSelectValue';

export const useSelectField = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Select, isFieldSelect, fieldDefinition);

  const { fieldName } = fieldDefinition.metadata;

  const [fieldValue, setFieldValue] = useRecoilState<FieldSelectValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const fieldSelectValue = isFieldSelectValue(fieldValue) ? fieldValue : null;
  const persistField = usePersistField();

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldSelectValue>(`${recordId}-${fieldName}`);
  const draftValue = useRecoilValue(getDraftValueSelector());

  return {
    fieldDefinition,
    persistField,
    fieldValue: fieldSelectValue,
    draftValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
  };
};
