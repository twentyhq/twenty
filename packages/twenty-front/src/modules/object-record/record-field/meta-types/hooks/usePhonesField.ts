import { useContext } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldPhones } from '@/object-record/record-field/types/guards/isFieldPhones';
import { phonesSchema } from '@/object-record/record-field/types/guards/isFieldPhonesValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const usePhonesField = () => {
  const { recordId, fieldDefinition, hotkeyScope } = useContext(FieldContext);

  assertFieldMetadata(FieldMetadataType.Phones, isFieldPhones, fieldDefinition);

  const fieldName = fieldDefinition.metadata.fieldName;

  const [fieldValue, setFieldValue] = useRecoilState<FieldPhonesValue>(
    recordStoreFamilySelector({
      recordId,
      fieldName: fieldName,
    }),
  );

  const { setDraftValue, getDraftValueSelector } =
    useRecordFieldInput<FieldPhonesValue>(`${recordId}-${fieldName}`);

  const draftValue = useRecoilValue(getDraftValueSelector());

  const persistField = usePersistField();

  const persistPhonesField = (nextValue: FieldPhonesValue) => {
    try {
      persistField(phonesSchema.parse(nextValue));
    } catch {
      return;
    }
  };

  return {
    fieldDefinition,
    fieldValue,
    draftValue,
    setDraftValue,
    setFieldValue,
    hotkeyScope,
    persistPhonesField,
  };
};
